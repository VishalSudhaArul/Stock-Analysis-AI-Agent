import { useState, useEffect } from "react";
import { getPortfolioApi } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";
import TradingModal from "./TradingModal";
import PaperSIPSimulator from "./PaperSIPSimulator";

const CURRENCY_MAP = {
  USD: { name: "US Dollar", symbol: "$", flag: "🇺🇸", rate: 1.0 },
  INR: { name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", rate: 83.5 },
  EUR: { name: "Euro", symbol: "€", flag: "🇪🇺", rate: 0.92 },
  GBP: { name: "British Pound", symbol: "£", flag: "🇬🇧", rate: 0.78 },
  JPY: { name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", rate: 154.2 },
  CAD: { name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", rate: 1.37 },
  AUD: { name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", rate: 1.52 },
  CHF: { name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", rate: 0.88 },
  CNY: { name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", rate: 7.25 },
  HKD: { name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰", rate: 7.82 },
  SGD: { name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", rate: 1.35 },
  AED: { name: "UAE Dirham", symbol: "AED", flag: "🇦🇪", rate: 3.67 },
  SAR: { name: "Saudi Riyal", symbol: "SAR", flag: "🇸🇦", rate: 3.75 },
  KRW: { name: "South Korean Won", symbol: "₩", flag: "🇰🇷", rate: 1380.0 },
  BRL: { name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", rate: 5.65 },
  MXN: { name: "Mexican Peso", symbol: "Mex$", flag: "🇲🇽", rate: 18.5 },
  RUB: { name: "Russian Ruble", symbol: "₽", flag: "🇷🇺", rate: 86.0 },
  ZAR: { name: "South African Rand", symbol: "R", flag: "🇿🇦", rate: 18.2 },
  SEK: { name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", rate: 10.7 },
  NZD: { name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿", rate: 1.68 },
};

function PortfolioDashboard({ onSearchStock }) {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tradeModalStock, setTradeModalStock] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState("USD");

  const fetchPortfolio = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      setError("");
      const res = await getPortfolioApi();
      if (res && res.success) {
        setPortfolioData(res.data);
        setLastUpdated(new Date());
      } else {
        if (!silent) setError(res?.error || res?.message || "Failed to load portfolio data.");
      }
    } catch (err) {
      console.error("Fetch portfolio error:", err);
      if (!silent) setError(err.response?.data?.error || err.response?.data?.message || "Error connecting to portfolio service.");
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolio(false);

    // Live market auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPortfolio(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="card col-full text-center" style={{ padding: "40px 20px" }}>
        <h3 style={{ color: "var(--negative)", marginBottom: "10px" }}>⚠️ Portfolio Load Error</h3>
        <p style={{ color: "var(--text-secondary)" }}>{error}</p>
        <button className="search-btn" onClick={() => fetchPortfolio(false)} style={{ margin: "20px auto 0 auto" }}>
          🔄 Retry Loading
        </button>
      </div>
    );
  }

  const {
    cashBalance = 100000,
    holdings = [],
    recentTransactions = [],
  } = portfolioData || {};

  // Read saved price alerts from localStorage
  let storedAlerts = {};
  try {
    storedAlerts = JSON.parse(localStorage.getItem("stock_price_alerts") || "{}");
  } catch (err) {
    console.warn("Could not parse price alerts:", err.message);
  }

  // Multi-Currency conversion calculation (20 Major World Currencies)
  const activeCurrencyConfig = CURRENCY_MAP[displayCurrency] || CURRENCY_MAP.USD;
  const curSymbol = activeCurrencyConfig.symbol;
  const multiplier = activeCurrencyConfig.rate;

  // Compute unified holdings value in USD
  const totalHoldingsValueUSD = holdings.reduce((sum, h) => {
    const isIndian = h.currency === "INR" || h.symbol.endsWith(".NS") || h.symbol.includes(":NSE");
    const valInUSD = h.currentValueUSD !== undefined ? h.currentValueUSD : (isIndian ? h.currentValue / 83.5 : h.currentValue);
    return sum + valInUSD;
  }, 0);

  const totalInvestedUSD = holdings.reduce((sum, h) => {
    const isIndian = h.currency === "INR" || h.symbol.endsWith(".NS") || h.symbol.includes(":NSE");
    const costInUSD = h.totalCostUSD !== undefined ? h.totalCostUSD : (isIndian ? h.totalCost / 83.5 : h.totalCost);
    return sum + costInUSD;
  }, 0);

  const totalValueUSD = cashBalance + totalHoldingsValueUSD;
  const totalPnlUSD = totalHoldingsValueUSD - totalInvestedUSD;
  const totalPnlPercent = totalInvestedUSD > 0 ? (totalPnlUSD / totalInvestedUSD) * 100 : 0;
  const isProfit = totalPnlUSD >= 0;

  // Sector allocation & Risk Score calculation (Feature #2)
  const sectorMap = {
    AAPL: "Technology",
    NVDA: "Technology",
    INFY: "Technology",
    TCS: "Technology",
    CIPLA: "Healthcare",
    IRFC: "Infrastructure",
    TATAMOTORS: "Automotive",
    RELIANCE: "Energy",
    TSLA: "Automotive",
  };

  const sectorTotals = {};
  let maxPositionShare = 0;
  let maxPositionSymbol = "";

  holdings.forEach((h) => {
    const sec = sectorMap[h.symbol.toUpperCase()] || "Diversified Equities";
    const isIndian = h.currency === "INR" || h.symbol.endsWith(".NS") || h.symbol.includes(":NSE");
    const valInUSD = h.currentValueUSD !== undefined ? h.currentValueUSD : (isIndian ? h.currentValue / 83.5 : h.currentValue);
    sectorTotals[sec] = (sectorTotals[sec] || 0) + valInUSD;

    const shareOfPort = totalHoldingsValueUSD > 0 ? (valInUSD / totalHoldingsValueUSD) * 100 : 0;
    if (shareOfPort > maxPositionShare) {
      maxPositionShare = shareOfPort;
      maxPositionSymbol = h.symbol;
    }
  });

  const sectorList = Object.entries(sectorTotals).map(([sec, val]) => ({
    sector: sec,
    valueUSD: val,
    percent: totalHoldingsValueUSD > 0 ? (val / totalHoldingsValueUSD) * 100 : 0,
  }));

  let riskLevel = "🟢 Low Risk (Balanced)";
  let riskColor = "var(--positive)";
  if (maxPositionShare > 50) {
    riskLevel = `🔴 High Risk (${maxPositionSymbol} ${maxPositionShare.toFixed(0)}% of Holdings)`;
    riskColor = "var(--negative)";
  } else if (maxPositionShare > 30) {
    riskLevel = `🟡 Moderate Risk (${maxPositionSymbol} ${maxPositionShare.toFixed(0)}% Concentration)`;
    riskColor = "#F59E0B";
  }

  return (
    <div className="portfolio-dashboard-container animate-fade-in-up">
      {/* Live Market Status Bar & Global 20-Currency Selector Dropdown */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--card-border)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isRefreshing ? '#F59E0B' : '#10B981', display: 'inline-block', boxShadow: isRefreshing ? '0 0 8px #F59E0B' : '0 0 8px #10B981' }}></span>
          <span><strong>Live Market Feed</strong> — Syncing every 30s ({lastUpdated.toLocaleTimeString()})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 20 Major World Currencies Dropdown Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>🌐 Base Currency:</span>
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
              style={{
                background: 'var(--card-bg)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {Object.entries(CURRENCY_MAP).map(([code, config]) => (
                <option key={code} value={code} style={{ background: '#111827', color: '#fff' }}>
                  {config.flag} {code} ({config.symbol}) — {config.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => fetchPortfolio(true)} 
            disabled={isRefreshing}
            style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-main)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isRefreshing ? "⏳ Syncing..." : "🔄 Refresh Prices"}
          </button>
        </div>
      </div>

      {/* Top Portfolio KPI Cards */}
      <div className="portfolio-metrics-grid">
        <div className="card metric-card">
          <span className="metric-card-label">Total Portfolio Value ({displayCurrency})</span>
          <span className="metric-card-value">
            {curSymbol}{(totalValueUSD * multiplier).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="card metric-card">
          <span className="metric-card-label">Available Buying Power ({displayCurrency})</span>
          <span className="metric-card-value" style={{ color: "var(--accent-primary)" }}>
            {curSymbol}{(cashBalance * multiplier).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="card metric-card">
          <span className="metric-card-label">Total Return (P&L)</span>
          <div className="pnl-badge-container">
            <span className={`pnl-value ${isProfit ? "diff-up" : "diff-down"}`}>
              {isProfit ? "+" : ""}{curSymbol}{(totalPnlUSD * multiplier).toFixed(2)} ({isProfit ? "+" : ""}{totalPnlPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-card-label">Active Stock Positions</span>
          <span className="metric-card-value">{holdings.length} {holdings.length === 1 ? "Stock" : "Stocks"}</span>
        </div>
      </div>

      {/* Portfolio Sector Allocation & AI Risk Breakdown (Feature #2) */}
      {holdings && holdings.length > 0 && (
        <div className="card" style={{ marginBottom: "24px", padding: "20px" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Portfolio Diversification & Sector Breakdown
            </h3>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: riskColor, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
              {riskLevel}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {sectorList.map((sec) => (
              <div key={sec.sector}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
                  <span>{sec.sector}</span>
                  <strong>{sec.percent.toFixed(1)}%</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--card-border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(sec.percent, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #60A5FA)', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Paper SIP Simulator & Sector Treemap */}
      <PaperSIPSimulator
        holdings={holdings}
        displayCurrency={displayCurrency}
        curSymbol={curSymbol}
        multiplier={multiplier}
      />

      {/* Current Holdings Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 className="section-title" style={{ margin: 0 }}>📊 Current Stock Holdings</h2>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Position Value: <strong>{curSymbol}{(totalHoldingsValueUSD * multiplier).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </span>
      </div>

      <div className="watchlist-table-container">
        {holdings && holdings.length > 0 ? (
          <table className="watchlist-table">
            <thead>
              <tr>
                <th>Symbol & Company</th>
                <th>Shares</th>
                <th>Avg Buy Price</th>
                <th>Live Price</th>
                <th>Position Value</th>
                <th>Unrealized P&L</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((item) => {
                const itemPnl = item.pnl ?? 0;
                const itemPnlPercent = item.pnlPercent ?? 0;
                const isHoldingProfit = itemPnl >= 0;
                const isIndian = item.currency === "INR" || item.symbol.endsWith(".NS") || item.symbol.includes(":NSE") || ["IRFC", "CIPLA", "INFY", "TATAMOTORS", "RELIANCE", "TCS", "CUPID", "ZOMATO", "PAYTM", "ITC"].includes(item.symbol.toUpperCase());
                const holdingSymbol = isIndian ? "₹" : "$";

                // Alert checks (Feature #4)
                const alert = storedAlerts[item.symbol];
                const isTargetReached = alert?.targetPrice && item.currentPrice >= alert.targetPrice;
                const isStopLossTriggered = alert?.stopLoss && item.currentPrice <= alert.stopLoss;

                return (
                  <tr key={item.symbol}>
                    <td>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: "var(--accent-primary)", fontSize: "1.05rem" }}>{item.symbol}</strong>
                          {isTargetReached && (
                            <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                              🎯 Target Reached
                            </span>
                          )}
                          {isStopLossTriggered && (
                            <span style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                              🛑 Stop-Loss Triggered
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.companyName}</div>
                      </div>
                    </td>
                    <td><strong style={{ color: "var(--text-primary)" }}>{item.shares}</strong></td>
                    <td>{holdingSymbol}{item.averageBuyPrice?.toFixed(2)}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{holdingSymbol}{item.currentPrice?.toFixed(2)}</span>
                    </td>
                    <td>
                      <strong>{holdingSymbol}{item.currentValue?.toFixed(2)}</strong>
                    </td>
                    <td className={isHoldingProfit ? "diff-up" : "diff-down"}>
                      <span style={{ fontWeight: 600 }}>
                        {isHoldingProfit ? "+" : ""}{holdingSymbol}{itemPnl.toFixed(2)} ({isHoldingProfit ? "+" : ""}{itemPnlPercent.toFixed(2)}%)
                      </span>
                    </td>
                    <td>
                      <div className="watchlist-btn-actions">
                        <button
                          className="table-btn"
                          onClick={() => onSearchStock(item.symbol)}
                        >
                          🔍 Deep Analysis
                        </button>
                        
                        {/* Quick Buy Button */}
                        <button
                          className="table-btn"
                          style={{ background: "rgba(59, 130, 246, 0.2)", borderColor: "rgba(59, 130, 246, 0.4)", color: "#60a5fa" }}
                          onClick={() =>
                            setTradeModalStock({
                              symbol: item.symbol,
                              companyName: item.companyName || item.symbol,
                              currentPrice: item.currentPrice,
                              currency: isIndian ? "INR" : "USD",
                              initialTradeType: "BUY",
                              initialShares: 1,
                              maxOwnedShares: item.shares,
                            })
                          }
                        >
                          ⚡ Buy
                        </button>

                        {/* Quick Sell Position Button (Requested Feature) */}
                        <button
                          className="table-btn"
                          style={{ background: "rgba(239, 68, 68, 0.2)", borderColor: "rgba(239, 68, 68, 0.4)", color: "#f87171" }}
                          onClick={() =>
                            setTradeModalStock({
                              symbol: item.symbol,
                              companyName: item.companyName || item.symbol,
                              currentPrice: item.currentPrice,
                              currency: isIndian ? "INR" : "USD",
                              initialTradeType: "SELL",
                              initialShares: item.shares,
                              maxOwnedShares: item.shares,
                            })
                          }
                        >
                          🔴 Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="watchlist-empty">
            <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)" }}>
              You have no active paper stock holdings.
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "8px" }}>
              Search for any stock on the AI Research Desk (e.g., AAPL, NVDA, TSLA) to execute your first trade!
            </p>
          </div>
        )}
      </div>

      {/* Transaction History Audit Ledger */}
      <h2 className="section-title" style={{ marginTop: "40px" }}>📜 Transaction Audit Ledger</h2>
      <div className="watchlist-table-container">
        {recentTransactions && recentTransactions.length > 0 ? (
          <table className="watchlist-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Order Type</th>
                <th>Asset Symbol</th>
                <th>Shares</th>
                <th>Execution Price</th>
                <th>Total Order Value</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => {
                const isIndianTx = tx.currency === "INR" || (tx.symbol || "").endsWith(".NS") || (tx.symbol || "").includes(":NSE") || ["IRFC", "CIPLA", "INFY", "TATAMOTORS", "RELIANCE", "TCS", "CUPID", "ZOMATO", "PAYTM", "ITC"].includes((tx.symbol || "").toUpperCase());
                const txCurrSymbol = isIndianTx ? "₹" : "$";

                return (
                  <tr key={tx.id || Math.random()}>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "Just Now"}
                    </td>
                    <td>
                      <span className={`watchlist-badge ${tx.type === "BUY" ? "rec-buy" : "rec-sell"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--accent-primary)" }}>{tx.symbol}</strong>
                    </td>
                    <td>{tx.shares}</td>
                    <td>{txCurrSymbol}{tx.price?.toFixed(2)}</td>
                    <td>
                      <strong>{txCurrSymbol}{(tx.shares * tx.price).toFixed(2)}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="watchlist-empty">No paper transactions executed yet.</div>
        )}
      </div>

      {/* Interactive Trading Modal */}
      {tradeModalStock && (
        <TradingModal
          isOpen={!!tradeModalStock}
          onClose={() => setTradeModalStock(null)}
          symbol={tradeModalStock.symbol}
          companyName={tradeModalStock.companyName}
          currentPrice={tradeModalStock.currentPrice}
          currency={tradeModalStock.currency}
          userBalance={cashBalance}
          initialTradeType={tradeModalStock.initialTradeType || "BUY"}
          initialShares={tradeModalStock.initialShares || 1}
          maxOwnedShares={tradeModalStock.maxOwnedShares || 0}
          onTradeComplete={() => fetchPortfolio()}
        />
      )}
    </div>
  );
}

export default PortfolioDashboard;
