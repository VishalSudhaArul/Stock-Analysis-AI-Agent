import prisma from "../utils/prisma.js";
import { getStockData } from "../services/stockService.js";
import fs from "fs";
import path from "path";

const FX_RATE_INR = 83.5; // 1 USD = 83.5 INR
const INDIAN_SYMBOLS = [
  "IRFC", "CIPLA", "INFY", "TATAMOTORS", "RELIANCE", "TCS",
  "CUPID", "ZOMATO", "PAYTM", "ITC", "HDFCBANK", "ICICIBANK", "SBIN", "WIPRO"
];

function isIndianSymbol(symbol, currency) {
  const sym = (symbol || "").toUpperCase();
  return (
    currency === "INR" ||
    sym.endsWith(".NS") ||
    sym.includes(":NSE") ||
    INDIAN_SYMBOLS.includes(sym)
  );
}

// Persistent File-backed / In-memory portfolio store
const STORAGE_FILE = path.resolve("data/memoryPortfolios.json");
const memoryPortfolios = new Map();

function loadMemoryPortfoliosFromDisk() {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      const data = JSON.parse(raw);
      for (const [key, value] of Object.entries(data)) {
        memoryPortfolios.set(key, value);
      }
    }
  } catch (err) {
    console.warn("[Portfolio Store Warning] Could not load portfolios from disk:", err.message);
  }
}

function saveMemoryPortfoliosToDisk() {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const obj = {};
    for (const [key, value] of memoryPortfolios.entries()) {
      obj[key] = value;
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Portfolio Store Warning] Could not save portfolios to disk:", err.message);
  }
}

loadMemoryPortfoliosFromDisk();

function getOrCreateMemoryPortfolio(userId) {
  if (!memoryPortfolios.has(userId)) {
    memoryPortfolios.set(userId, {
      id: "port_" + userId,
      userId,
      name: "Default Portfolio",
      balance: 100000.0, // Stored in USD
      transactions: [],
    });
    saveMemoryPortfoliosToDisk();
  }
  return memoryPortfolios.get(userId);
}

// Helper: Auto-repair cash balance in USD based on transaction history
function recalculatePortfolioBalanceUSD(transactions) {
  let balanceUSD = 100000.0;
  const sorted = [...transactions].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

  for (const tx of sorted) {
    const isIndian = isIndianSymbol(tx.symbol, tx.currency);
    const priceUSD = tx.priceInUSD || (isIndian ? tx.price / FX_RATE_INR : tx.price);
    const costUSD = tx.shares * priceUSD;

    if (tx.type === "BUY") {
      balanceUSD -= costUSD;
    } else if (tx.type === "SELL") {
      balanceUSD += costUSD;
    }
  }

  return Math.max(0, balanceUSD);
}

// Helper: Calculate holdings and cost basis from transaction ledger in USD
async function calculatePortfolioHoldingsFromTxList(transactions) {
  const holdingsMap = {};

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
  );

  for (const tx of sortedTransactions) {
    const symbol = (tx.symbol || "").toUpperCase();
    const isIndian = isIndianSymbol(symbol, tx.currency);
    const priceUSD = tx.priceInUSD || (isIndian ? tx.price / FX_RATE_INR : tx.price);
    const { type, shares } = tx;

    if (!holdingsMap[symbol]) {
      holdingsMap[symbol] = {
        symbol,
        shares: 0,
        totalCostUSD: 0,
        averageBuyPriceUSD: 0,
        isIndian,
      };
    }

    const holding = holdingsMap[symbol];

    if (type === "BUY") {
      holding.shares += shares;
      holding.totalCostUSD += shares * priceUSD;
      holding.averageBuyPriceUSD = holding.shares > 0 ? holding.totalCostUSD / holding.shares : 0;
    } else if (type === "SELL") {
      if (holding.shares > 0) {
        const sharesToSell = Math.min(holding.shares, shares);
        holding.shares -= sharesToSell;
        holding.totalCostUSD = holding.shares * holding.averageBuyPriceUSD;
        if (holding.shares <= 0.0001) {
          holding.shares = 0;
          holding.totalCostUSD = 0;
          holding.averageBuyPriceUSD = 0;
        }
      }
    }
  }

  return Object.values(holdingsMap).filter((h) => h.shares > 0.0001);
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
            orderBy: { timestamp: "asc" },
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
            transactions: {
              orderBy: { timestamp: "asc" },
            },
          },
        });
      }
      transactionsList = portfolio.transactions || [];
    } catch (dbErr) {
      console.warn("[Prisma Warning] DB portfolio fetch failed, using in-memory fallback:", dbErr.message);
      portfolio = getOrCreateMemoryPortfolio(userId);
      transactionsList = portfolio.transactions || [];
    }

    // Auto-repair cash balance in USD
    const correctedBalanceUSD = recalculatePortfolioBalanceUSD(transactionsList);
    portfolio.balance = correctedBalanceUSD;

    const holdings = await calculatePortfolioHoldingsFromTxList(transactionsList);

    let totalHoldingsValueUSD = 0;
    const holdingsWithPrices = await Promise.all(
      holdings.map(async (holding) => {
        let currentPriceLocal = holding.averageBuyPriceUSD * (holding.isIndian ? FX_RATE_INR : 1);
        let changePercent = 0;
        let companyName = "N/A";
        let fetchedCurrency = holding.isIndian ? "INR" : "USD";

        try {
          const stockData = await getStockData(holding.symbol);
          if (stockData) {
            currentPriceLocal = stockData.currentPrice || currentPriceLocal;
            companyName = stockData.companyName || "N/A";
            fetchedCurrency = stockData.currency || fetchedCurrency;
            if (stockData.currentPrice && stockData.previousClose) {
              changePercent = ((stockData.currentPrice - stockData.previousClose) / stockData.previousClose) * 100;
            }
          }
        } catch (err) {
          console.warn(`[Price Fetch Fail] ${holding.symbol}:`, err.message);
        }

        const isIndian = isIndianSymbol(holding.symbol, fetchedCurrency);
        const currentPriceUSD = isIndian ? currentPriceLocal / FX_RATE_INR : currentPriceLocal;
        const currentValueUSD = holding.shares * currentPriceUSD;
        const costBasisUSD = holding.shares * holding.averageBuyPriceUSD;
        const pnlUSD = currentValueUSD - costBasisUSD;
        const pnlPercent = costBasisUSD > 0 ? (pnlUSD / costBasisUSD) * 100 : 0;

        totalHoldingsValueUSD += currentValueUSD;

        const avgBuyPriceLocal = isIndian ? holding.averageBuyPriceUSD * FX_RATE_INR : holding.averageBuyPriceUSD;
        const currentValueLocal = holding.shares * currentPriceLocal;
        const pnlLocal = isIndian ? pnlUSD * FX_RATE_INR : pnlUSD;

        return {
          symbol: holding.symbol,
          companyName,
          shares: parseFloat(holding.shares.toFixed(4)),
          averageBuyPrice: parseFloat(avgBuyPriceLocal.toFixed(2)),
          averageBuyPriceUSD: parseFloat(holding.averageBuyPriceUSD.toFixed(2)),
          totalCost: parseFloat((holding.shares * avgBuyPriceLocal).toFixed(2)),
          totalCostUSD: parseFloat(costBasisUSD.toFixed(2)),
          currentPrice: parseFloat(currentPriceLocal.toFixed(2)),
          currentPriceUSD: parseFloat(currentPriceUSD.toFixed(2)),
          currentValue: parseFloat(currentValueLocal.toFixed(2)),
          currentValueUSD: parseFloat(currentValueUSD.toFixed(2)),
          pnl: parseFloat(pnlLocal.toFixed(2)),
          pnlUSD: parseFloat(pnlUSD.toFixed(2)),
          pnlPercent: parseFloat(pnlPercent.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          currency: isIndian ? "INR" : "USD",
        };
      })
    );

    const totalInvestedUSD = holdings.reduce((sum, h) => sum + h.totalCostUSD, 0);
    const totalPnlUSD = totalHoldingsValueUSD - totalInvestedUSD;
    const totalPnlPercent = totalInvestedUSD > 0 ? (totalPnlUSD / totalInvestedUSD) * 100 : 0;

    const enrichedTransactions = [...transactionsList]
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .map((tx) => {
        const isIndian = isIndianSymbol(tx.symbol, tx.currency);
        return {
          ...tx,
          currency: isIndian ? "INR" : "USD",
        };
      });

    return res.json({
      success: true,
      data: {
        id: portfolio.id,
        name: portfolio.name,
        cashBalance: parseFloat(correctedBalanceUSD.toFixed(2)), // in USD
        holdingsValue: parseFloat(totalHoldingsValueUSD.toFixed(2)), // in USD
        totalValue: parseFloat((correctedBalanceUSD + totalHoldingsValueUSD).toFixed(2)), // in USD
        totalInvested: parseFloat(totalInvestedUSD.toFixed(2)), // in USD
        totalPnl: parseFloat(totalPnlUSD.toFixed(2)), // in USD
        totalPnlPercent: parseFloat(totalPnlPercent.toFixed(2)),
        holdings: holdingsWithPrices,
        recentTransactions: enrichedTransactions,
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

    const marketPriceLocal = stockData.currentPrice;
    const isIndian = isIndianSymbol(symbol, stockData.currency);
    const marketPriceUSD = isIndian ? marketPriceLocal / FX_RATE_INR : marketPriceLocal;
    const transactionCostUSD = shares * marketPriceUSD;

    let tradeResult = null;

    try {
      let portfolio = await prisma.portfolio.findFirst({
        where: { userId },
        include: { transactions: true },
      });

      if (!portfolio) {
        portfolio = await prisma.portfolio.create({
          data: {
            userId,
            name: "Default Portfolio",
            balance: 100000.0,
          },
          include: { transactions: true },
        });
      }

      const currentBalanceUSD = recalculatePortfolioBalanceUSD(portfolio.transactions || []);

      if (tradeType === "BUY") {
        if (currentBalanceUSD < transactionCostUSD) {
          const reqDisplay = isIndian ? `₹${(transactionCostUSD * FX_RATE_INR).toFixed(2)} ($${transactionCostUSD.toFixed(2)} USD)` : `$${transactionCostUSD.toFixed(2)} USD`;
          const availDisplay = `$${currentBalanceUSD.toFixed(2)} USD`;
          throw new Error(`Insufficient buying power. Required: ${reqDisplay}, Available: ${availDisplay}`);
        }

        const newBalanceUSD = Math.max(0, currentBalanceUSD - transactionCostUSD);
        const updatedPortfolio = await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { balance: newBalanceUSD },
        });

        const newTx = await prisma.transaction.create({
          data: {
            portfolioId: portfolio.id,
            symbol: symbol.toUpperCase(),
            type: "BUY",
            shares,
            price: marketPriceLocal,
          },
        });

        tradeResult = { portfolio: updatedPortfolio, transaction: newTx };
      } else {
        const txs = portfolio.transactions || [];

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

        const newBalanceUSD = currentBalanceUSD + transactionCostUSD;
        const updatedPortfolio = await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: { balance: newBalanceUSD },
        });

        const newTx = await prisma.transaction.create({
          data: {
            portfolioId: portfolio.id,
            symbol: symbol.toUpperCase(),
            type: "SELL",
            shares,
            price: marketPriceLocal,
          },
        });

        tradeResult = { portfolio: updatedPortfolio, transaction: newTx };
      }
    } catch (dbErr) {
      if (dbErr.message && dbErr.message.includes("Insufficient")) {
        throw dbErr;
      }

      console.warn("[Prisma Warning] DB trade execution failed, using persistent in-memory fallback:", dbErr.message);
      const memPort = getOrCreateMemoryPortfolio(userId);

      const currentBalanceUSD = recalculatePortfolioBalanceUSD(memPort.transactions || []);

      if (tradeType === "BUY") {
        if (currentBalanceUSD < transactionCostUSD) {
          const reqDisplay = isIndian ? `₹${(transactionCostUSD * FX_RATE_INR).toFixed(2)} ($${transactionCostUSD.toFixed(2)} USD)` : `$${transactionCostUSD.toFixed(2)} USD`;
          const availDisplay = `$${currentBalanceUSD.toFixed(2)} USD`;
          throw new Error(`Insufficient buying power. Required: ${reqDisplay}, Available: ${availDisplay}`);
        }
        memPort.balance = currentBalanceUSD - transactionCostUSD;
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
        memPort.balance = currentBalanceUSD + transactionCostUSD;
      }

      const newTx = {
        id: "tx_" + Math.random().toString(36).substring(2, 10),
        portfolioId: memPort.id,
        symbol: symbol.toUpperCase(),
        type: tradeType,
        shares,
        price: marketPriceLocal,
        timestamp: new Date().toISOString(),
      };

      memPort.transactions.push(newTx);
      saveMemoryPortfoliosToDisk();
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

// Watchlist Controllers (MongoDB Atlas Persistent Storage)
const WATCHLIST_BACKUP_FILE = path.resolve("data/watchlistBackupCache.json");
const memoryWatchlists = new Map();

function loadWatchlistsFromDisk() {
  try {
    const dir = path.dirname(WATCHLIST_BACKUP_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(WATCHLIST_BACKUP_FILE)) {
      const raw = fs.readFileSync(WATCHLIST_BACKUP_FILE, "utf-8");
      const data = JSON.parse(raw);
      for (const [key, value] of Object.entries(data)) {
        memoryWatchlists.set(key, value);
      }
    }
  } catch (err) {
    console.warn("[Watchlist Cache Warning] Could not load watchlist backup:", err.message);
  }
}

function saveWatchlistsToDisk() {
  try {
    const dir = path.dirname(WATCHLIST_BACKUP_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const obj = {};
    for (const [key, value] of memoryWatchlists.entries()) {
      obj[key] = value;
    }
    fs.writeFileSync(WATCHLIST_BACKUP_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Watchlist Cache Warning] Could not save watchlist backup:", err.message);
  }
}

loadWatchlistsFromDisk();

export async function getWatchlist(req, res) {
  try {
    const userId = req.user.userId;
    let list = [];

    try {
      list = await prisma.watchlistItem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch (dbErr) {
      console.warn("[Watchlist DB Warning] Primary DB fetch failed, using backup cache:", dbErr.message);
      list = memoryWatchlists.get(userId) || [];
    }

    // Always keep cache updated
    memoryWatchlists.set(userId, list);
    saveWatchlistsToDisk();

    return res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Get Watchlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve watchlist",
      error: error.message,
    });
  }
}

export async function addToWatchlist(req, res) {
  try {
    const userId = req.user.userId;
    const { symbol, companyName } = req.body;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "Stock symbol is required",
      });
    }

    const cleanSymbol = symbol.toUpperCase().trim();
    const cleanCompany = companyName || cleanSymbol;
    let item = null;

    try {
      item = await prisma.watchlistItem.upsert({
        where: {
          userId_symbol: {
            userId,
            symbol: cleanSymbol,
          },
        },
        update: {
          companyName: cleanCompany,
        },
        create: {
          userId,
          symbol: cleanSymbol,
          companyName: cleanCompany,
        },
      });
    } catch (dbErr) {
      console.warn("[Watchlist DB Warning] Primary DB upsert failed, saving to backup cache:", dbErr.message);
      let userList = memoryWatchlists.get(userId) || [];
      const existingIdx = userList.findIndex((x) => x.symbol === cleanSymbol);
      item = {
        id: "w_" + Math.random().toString(36).substring(2, 10),
        userId,
        symbol: cleanSymbol,
        companyName: cleanCompany,
        createdAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        userList[existingIdx] = item;
      } else {
        userList.unshift(item);
      }
      memoryWatchlists.set(userId, userList);
      saveWatchlistsToDisk();
    }

    // Keep cache fresh
    let currentCache = memoryWatchlists.get(userId) || [];
    if (!currentCache.some((x) => x.symbol === cleanSymbol)) {
      currentCache.unshift(item);
      memoryWatchlists.set(userId, currentCache);
      saveWatchlistsToDisk();
    }

    return res.status(201).json({
      success: true,
      message: `Added ${cleanSymbol} to watchlist`,
      data: item,
    });
  } catch (error) {
    console.error("Add To Watchlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add stock to watchlist",
      error: error.message,
    });
  }
}

export async function removeFromWatchlist(req, res) {
  try {
    const userId = req.user.userId;
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "Stock symbol parameter is required",
      });
    }

    const cleanSymbol = symbol.toUpperCase().trim();

    try {
      await prisma.watchlistItem.deleteMany({
        where: {
          userId,
          symbol: cleanSymbol,
        },
      });
    } catch (dbErr) {
      console.warn("[Watchlist DB Warning] Primary DB delete failed:", dbErr.message);
    }

    // Remove from backup cache
    let userList = memoryWatchlists.get(userId) || [];
    userList = userList.filter((x) => x.symbol !== cleanSymbol);
    memoryWatchlists.set(userId, userList);
    saveWatchlistsToDisk();

    return res.json({
      success: true,
      message: `Removed ${cleanSymbol} from watchlist`,
    });
  } catch (error) {
    console.error("Remove From Watchlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove stock from watchlist",
      error: error.message,
    });
  }
}


