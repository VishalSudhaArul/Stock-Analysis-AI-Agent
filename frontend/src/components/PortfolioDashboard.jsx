import { useState, useEffect } from "react";
import { getPortfolioApi } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";
import TradingModal from "./TradingModal";

function PortfolioDashboard({ onSearchStock }) {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tradeModalStock, setTradeModalStock] = useState(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPortfolioApi();
      if (res && res.success) {
        setPortfolioData(res.data);
      } else {
        setError(res?.error || res?.message || "Failed to load portfolio data.");
      }
    } catch (err) {
      console.error("Fetch portfolio error:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Error connecting to portfolio service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="card col-full text-center" style={{ padding: "40px 20px" }}>
        <h3 style={{ color: "var(--negative)", marginBottom: "10px" }}>⚠️ Portfolio Load Error</h3>
        <p style={{ color: "var(--text-secondary)" }}>{error}</p>
        <button className="search-btn" onClick={fetchPortfolio} style={{ margin: "20px auto 0 auto" }}>
          🔄 Retry Loading
        </button>
      </div>
    );
  }

  const {
    cashBalance = 100000,
    totalValue = 100000,
    holdingsValue = 0,
    totalPnl = 0,
    totalPnlPercent = 0,
    holdings = [],
    recentTransactions = [],
  } = portfolioData || {};

  const isProfit = totalPnl >= 0;

  return (
    <div className="portfolio-dashboard-container animate-fade-in-up">
      {/* Top Portfolio KPI Cards */}
      <div className="portfolio-metrics-grid">
        <div className="card metric-card">
          <span className="metric-card-label">Total Portfolio Value</span>
          <span className="metric-card-value">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="card metric-card">
          <span className="metric-card-label">Available Buying Power</span>
          <span className="metric-card-value" style={{ color: "var(--accent-primary)" }}>
            ${cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="card metric-card">
          <span className="metric-card-label">Total Return (P&L)</span>
          <div className="pnl-badge-container">
            <span className={`pnl-value ${isProfit ? "diff-up" : "diff-down"}`}>
              {isProfit ? "+" : ""}${totalPnl.toFixed(2)} ({isProfit ? "+" : ""}{totalPnlPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-card-label">Active Stock Positions</span>
          <span className="metric-card-value">{holdings.length} {holdings.length === 1 ? "Stock" : "Stocks"}</span>
        </div>
      </div>

      {/* Current Holdings Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 className="section-title" style={{ margin: 0 }}>📊 Current Stock Holdings</h2>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Position Value: <strong>${holdingsValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
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

                return (
                  <tr key={item.symbol}>
                    <td>
                      <div>
                        <strong style={{ color: "var(--accent-primary)", fontSize: "1.05rem" }}>{item.symbol}</strong>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.companyName}</div>
                      </div>
                    </td>
                    <td><strong style={{ color: "var(--text-primary)" }}>{item.shares}</strong></td>
                    <td>${item.averageBuyPrice?.toFixed(2)}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>${item.currentPrice?.toFixed(2)}</span>
                    </td>
                    <td>
                      <strong>${item.currentValue?.toFixed(2)}</strong>
                    </td>
                    <td className={isHoldingProfit ? "diff-up" : "diff-down"}>
                      <span style={{ fontWeight: 600 }}>
                        {isHoldingProfit ? "+" : ""}${itemPnl.toFixed(2)} ({isHoldingProfit ? "+" : ""}{itemPnlPercent.toFixed(2)}%)
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
                        <button
                          className="table-btn"
                          style={{ background: "rgba(59, 130, 246, 0.2)", borderColor: "rgba(59, 130, 246, 0.4)", color: "#60a5fa" }}
                          onClick={() =>
                            setTradeModalStock({
                              symbol: item.symbol,
                              companyName: item.companyName || item.symbol,
                              currentPrice: item.currentPrice,
                            })
                          }
                        >
                          ⚡ Trade
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
              {recentTransactions.map((tx) => (
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
                  <td>${tx.price?.toFixed(2)}</td>
                  <td>
                    <strong>${(tx.shares * tx.price).toFixed(2)}</strong>
                  </td>
                </tr>
              ))}
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
          userBalance={cashBalance}
          onTradeComplete={() => fetchPortfolio()}
        />
      )}
    </div>
  );
}

export default PortfolioDashboard;
