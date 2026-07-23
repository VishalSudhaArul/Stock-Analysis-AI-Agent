import prisma from "../utils/prisma.js";
import { getStockData } from "../services/stockService.js";

// Helper: Calculate holdings and cost basis from transaction ledger
async function calculatePortfolioHoldings(portfolioId) {
  const transactions = await prisma.transaction.findMany({
    where: { portfolioId },
    orderBy: { timestamp: "asc" },
  });

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
        // Cost basis reduces proportionally based on original average buy price
        holding.totalCost = holding.shares * holding.averageBuyPrice;
      } else {
        // Safe guard fallback: reset to 0 if transaction anomalies occur
        holding.shares = 0;
        holding.totalCost = 0;
        holding.averageBuyPrice = 0;
      }
    }
  }

  // Filter out liquidated holdings
  return Object.values(holdingsMap).filter((h) => h.shares > 0);
}

export async function getPortfolio(req, res) {
  try {
    const userId = req.user.userId;

    // Get user's default portfolio
    let portfolio = await prisma.portfolio.findFirst({
      where: { userId },
      include: {
        transactions: {
          orderBy: { timestamp: "desc" },
          take: 20, // Return last 20 transactions
        },
      },
    });

    // Fallback: If portfolio is missing for some reason, provision it
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

    // Calculate raw holdings from ledger
    const holdings = await calculatePortfolioHoldings(portfolio.id);

    // Fetch fresh current prices for holdings in parallel
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
        recentTransactions: portfolio.transactions,
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

    // Fetch the live price of the symbol to execute trade at market price
    const stockData = await getStockData(symbol);
    if (!stockData || !stockData.currentPrice) {
      return res.status(400).json({
        success: false,
        message: `Could not retrieve live price for symbol "${symbol}" to execute trade`,
      });
    }

    const marketPrice = stockData.currentPrice;
    const transactionCost = shares * marketPrice;

    // Use Prisma transaction to lock portfolio balance and write transaction ledger
    const result = await prisma.$transaction(async (tx) => {
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

        // Deduct balance and create buy ledger item
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
        // SELL transaction: Check holdings first
        // 1. Gather all transactions in portfolio
        const txs = await tx.transaction.findMany({
          where: { portfolioId: portfolio.id },
        });

        // 2. Sum up user's net shares for target symbol
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

        // Add proceeds to balance and write sell ledger item
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

    return res.json({
      success: true,
      message: `Successfully executed ${tradeType} order for ${shares} shares of ${symbol.toUpperCase()}`,
      data: {
        newBalance: parseFloat(result.portfolio.balance.toFixed(2)),
        transaction: result.transaction,
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
