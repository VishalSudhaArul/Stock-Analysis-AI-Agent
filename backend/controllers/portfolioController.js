import prisma from "../utils/prisma.js";
import { getStockData } from "../services/stockService.js";

// In-memory fallback portfolio store
const memoryPortfolios = new Map();

function getOrCreateMemoryPortfolio(userId) {
  if (!memoryPortfolios.has(userId)) {
    memoryPortfolios.set(userId, {
      id: "port_" + userId,
      userId,
      name: "Default Portfolio",
      balance: 100000.0,
      transactions: [],
    });
  }
  return memoryPortfolios.get(userId);
}

// Helper: Calculate holdings and cost basis from transaction ledger
async function calculatePortfolioHoldingsFromTxList(transactions) {
  const holdingsMap = {};

  for (const tx of transactions) {
    const { symbol, type, shares, price } = tx;

    if (!holdingsMap[symbol]) {
      holdingsMap[symbol] = {
        symbol,
        shares: 0,
        totalCost: 0,
        averageBuyPrice: 0,
      };
    }

    const holding = holdingsMap[symbol];

    if (type === "BUY") {
      holding.shares += shares;
      holding.totalCost += shares * price;
      holding.averageBuyPrice = holding.totalCost / holding.shares;
    } else if (type === "SELL") {
      if (holding.shares >= shares) {
        holding.shares -= shares;
        holding.totalCost = holding.shares * holding.averageBuyPrice;
      } else {
        holding.shares = 0;
        holding.totalCost = 0;
        holding.averageBuyPrice = 0;
      }
    }
  }

  return Object.values(holdingsMap).filter((h) => h.shares > 0);
}

export async function getPortfolio(req, res) {
  try {
    const userId = req.user.userId;
    let portfolio = null;
    let transactionsList = [];

    try {
      portfolio = await prisma.portfolio.findFirst({
        where: { userId },
        include: {
          transactions: {
            orderBy: { timestamp: "desc" },
            take: 20,
          },
        },
      });

      if (!portfolio) {
        portfolio = await prisma.portfolio.create({
          data: {
            userId,
            name: "Default Portfolio",
            balance: 100000.0,
          },
          include: {
            transactions: true,
          },
        });
      }
      transactionsList = portfolio.transactions || [];
    } catch (dbErr) {
      console.warn("[Prisma Database Warning] Cloud DB portfolio fetch failed, using in-memory fallback:", dbErr.message);
      portfolio = getOrCreateMemoryPortfolio(userId);
      transactionsList = portfolio.transactions || [];
    }

    const holdings = await calculatePortfolioHoldingsFromTxList(transactionsList);

    let totalHoldingsValue = 0;
    const holdingsWithPrices = await Promise.all(
      holdings.map(async (holding) => {
        let currentPrice = holding.averageBuyPrice;
        let changePercent = 0;
        let companyName = "N/A";

        try {
          const stockData = await getStockData(holding.symbol);
          if (stockData) {
            currentPrice = stockData.currentPrice;
            companyName = stockData.companyName || "N/A";
            if (stockData.currentPrice && stockData.previousClose) {
              changePercent = ((stockData.currentPrice - stockData.previousClose) / stockData.previousClose) * 100;
            }
          }
        } catch (err) {
          console.warn(`[Price Fetch Fail] Could not get live price for holding ${holding.symbol}:`, err.message);
        }

        const currentValue = holding.shares * currentPrice;
        const costBasis = holding.shares * holding.averageBuyPrice;
        const pnl = currentValue - costBasis;
        const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

        totalHoldingsValue += currentValue;

        return {
          symbol: holding.symbol,
          companyName,
          shares: holding.shares,
          averageBuyPrice: parseFloat(holding.averageBuyPrice.toFixed(2)),
          totalCost: parseFloat(costBasis.toFixed(2)),
          currentPrice: parseFloat(currentPrice.toFixed(2)),
          currentValue: parseFloat(currentValue.toFixed(2)),
          pnl: parseFloat(pnl.toFixed(2)),
          pnlPercent: parseFloat(pnlPercent.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
        };
      })
    );

    const totalInvested = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalPnl = totalHoldingsValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    return res.json({
      success: true,
      data: {
        id: portfolio.id,
        name: portfolio.name,
        cashBalance: parseFloat(portfolio.balance.toFixed(2)),
        holdingsValue: parseFloat(totalHoldingsValue.toFixed(2)),
        totalValue: parseFloat((portfolio.balance + totalHoldingsValue).toFixed(2)),
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalPnl: parseFloat(totalPnl.toFixed(2)),
        totalPnlPercent: parseFloat(totalPnlPercent.toFixed(2)),
        holdings: holdingsWithPrices,
        recentTransactions: transactionsList,
      },
    });
  } catch (error) {
    console.error("Get Portfolio Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve portfolio data",
      error: error.message,
    });
  }
}

export async function executeTrade(req, res) {
  try {
    const { symbol, type, shares } = req.body;
    const userId = req.user.userId;

    if (!symbol || !type || !shares || shares <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid symbol, type (BUY/SELL), or share quantity",
      });
    }

    const tradeType = type.toUpperCase();
    if (tradeType !== "BUY" && tradeType !== "SELL") {
      return res.status(400).json({
        success: false,
        message: "Trade type must be BUY or SELL",
      });
    }

    const stockData = await getStockData(symbol);
    if (!stockData || !stockData.currentPrice) {
      return res.status(400).json({
        success: false,
        message: `Could not retrieve live price for symbol "${symbol}" to execute trade`,
      });
    }

    const marketPrice = stockData.currentPrice;
    const transactionCost = shares * marketPrice;

    let tradeResult = null;

    try {
      tradeResult = await prisma.$transaction(async (tx) => {
        let portfolio = await tx.portfolio.findFirst({
          where: { userId },
        });

        if (!portfolio) {
          portfolio = await tx.portfolio.create({
            data: {
              userId,
              name: "Default Portfolio",
              balance: 100000.0,
            },
          });
        }

        if (tradeType === "BUY") {
          if (portfolio.balance < transactionCost) {
            throw new Error(`Insufficient funds. Required: $${transactionCost.toFixed(2)}, Available: $${portfolio.balance.toFixed(2)}`);
          }

          const updatedPortfolio = await tx.portfolio.update({
            where: { id: portfolio.id },
            data: { balance: { decrement: transactionCost } },
          });

          const newTx = await tx.transaction.create({
            data: {
              portfolioId: portfolio.id,
              symbol: symbol.toUpperCase(),
              type: "BUY",
              shares,
              price: marketPrice,
            },
          });

          return { portfolio: updatedPortfolio, transaction: newTx };
        } else {
          const txs = await tx.transaction.findMany({
            where: { portfolioId: portfolio.id },
          });

          let ownedShares = 0;
          for (const t of txs) {
            if (t.symbol === symbol.toUpperCase()) {
              if (t.type === "BUY") ownedShares += t.shares;
              else if (t.type === "SELL") ownedShares -= t.shares;
            }
          }

          if (ownedShares < shares) {
            throw new Error(`Insufficient shares of ${symbol.toUpperCase()}. Owned: ${ownedShares}, Attempted trade: ${shares}`);
          }

          const updatedPortfolio = await tx.portfolio.update({
            where: { id: portfolio.id },
            data: { balance: { increment: transactionCost } },
          });

          const newTx = await tx.transaction.create({
            data: {
              portfolioId: portfolio.id,
              symbol: symbol.toUpperCase(),
              type: "SELL",
              shares,
              price: marketPrice,
            },
          });

          return { portfolio: updatedPortfolio, transaction: newTx };
        }
      });
    } catch (dbErr) {
      if (dbErr.message.includes("Insufficient")) {
        throw dbErr; // Rethrow business logic validation errors
      }

      console.warn("[Prisma Database Warning] Cloud DB transaction failed, using in-memory trade execution fallback:", dbErr.message);
      const memPort = getOrCreateMemoryPortfolio(userId);

      if (tradeType === "BUY") {
        if (memPort.balance < transactionCost) {
          throw new Error(`Insufficient funds. Required: $${transactionCost.toFixed(2)}, Available: $${memPort.balance.toFixed(2)}`);
        }
        memPort.balance -= transactionCost;
      } else {
        let ownedShares = 0;
        for (const t of memPort.transactions) {
          if (t.symbol === symbol.toUpperCase()) {
            if (t.type === "BUY") ownedShares += t.shares;
            else if (t.type === "SELL") ownedShares -= t.shares;
          }
        }
        if (ownedShares < shares) {
          throw new Error(`Insufficient shares of ${symbol.toUpperCase()}. Owned: ${ownedShares}, Attempted trade: ${shares}`);
        }
        memPort.balance += transactionCost;
      }

      const newTx = {
        id: "tx_" + Math.random().toString(36).substring(2, 10),
        portfolioId: memPort.id,
        symbol: symbol.toUpperCase(),
        type: tradeType,
        shares,
        price: marketPrice,
        timestamp: new Date().toISOString(),
      };

      memPort.transactions.unshift(newTx);
      tradeResult = { portfolio: memPort, transaction: newTx };
    }

    return res.json({
      success: true,
      message: `Successfully executed ${tradeType} order for ${shares} shares of ${symbol.toUpperCase()}`,
      data: {
        newBalance: parseFloat(tradeResult.portfolio.balance.toFixed(2)),
        transaction: tradeResult.transaction,
      },
    });
  } catch (error) {
    console.error("Execute Trade Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to execute mock trade",
    });
  }
}
