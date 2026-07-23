import { useState, useEffect } from "react";
import { getPortfolioApi } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";
import TradingModal from "./TradingModal";

function PortfolioDashboard({ onSearchStock }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tradeModalStock, setTradeModalStock] = useState(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getPortfolioApi();
      if (res.success) {
        setPortfolio(res.portfolio);
      } else {
        setError(res.error || "Failed to load portfolio.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error connecting to portfolio service.");
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
        <h3 style={{ color: "var(--negative)", marginBottom: "10px" }}>⚠️ Portfolio Error</h3>
        <p>{error}</p>
        <button className="search-btn" onClick={fetchPortfolio} style={{ margin: "20px auto 0 auto" }}>
          Retry Loading
        </button>
      </div>
    );
  }

  const { balance, totalValue, totalProfitLoss, profitLossPercentage, holdings, transactions } =
    portfolio || {};

  const isProfit = (totalProfitLoss || 0) >= 0;

  return (
    <div className="portfolio-dashboard-container animate-fade-in-up">
      {/* Portfolio Header Cards */}
      <div className="portfolio-metrics-grid">
        <div className="card metric-card">
          <span className="metric-card-label">Total Portfolio Value</span>
          <span className="metric-card-value">${totalValue?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="card metric-card">
          <span className="metric-card-label">Available Cash</span>
          <span className="metric-card-value">${balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="card metric-card">
          <span className="metric-card-label">Total Return (P&L)</span>
          <div className="pnl-badge-container">
            <span className={`pnl-value ${isProfit ? "diff-up" : "diff-down"}`}>
              {isProfit ? "+" : ""}${totalProfitLoss?.toFixed(2)} ({isProfit ? "+" : ""}{profitLossPercentage?.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <span className="metric-card-label">Active Assets</span>
          <span className="metric-card-value">{holdings?.length || 0} Stocks</span>
        </div>
      </div>

      {/* Holdings Section */}
      <h2 className="section-title">📊 Current Stock Holdings</h2>
      <div className="watchlist-table-container">
        {holdings && holdings.length > 0 ? (
          <table className="watchlist-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Avg Cost</th>
                <th>Current Price</th>
                <th>Total Value</th>
                <th>Unrealized P&L</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((item) => {
                const isHoldingProfit = (item.profitLoss || 0) >= 0;
                return (
                  <tr key={item.symbol}>
                    <td>
                      <strong style={{ color: "var(--accent-primary)" }}>{item.symbol}</strong>
                    </td>
                    <td>{item.shares}</td>
                    <td>${item.avgBuyPrice?.toFixed(2)}</td>
                    <td>${item.currentPrice?.toFixed(2)}</td>
                    <td>${item.currentValue?.toFixed(2)}</td>
                    <td className={isHoldingProfit ? "diff-up" : "diff-down"}>
                      {isHoldingProfit ? "+" : ""}${item.profitLoss?.toFixed(2)} ({isHoldingProfit ? "+" : ""}
                      {item.profitLossPercentage?.toFixed(2)}%)
                    </td>
                    <td>
                      <div className="watchlist-btn-actions">
                        <button
                          className="table-btn"
                          onClick={() => onSearchStock(item.symbol)}
                        >
                          🔍 Analyze
                        </button>
                        <button
                          className="table-btn"
                          style={{ background: "rgba(59, 130, 246, 0.2)", borderColor: "rgba(59, 130, 246, 0.4)" }}
                          onClick={() =>
                            setTradeModalStock({
                              symbol: item.symbol,
                              companyName: item.symbol,
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
            <p>You have no active paper stock holdings.</p>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "8px" }}>
              Search for any stock on the Research Desk (e.g., AAPL, NVDA, TSLA) to execute your first trade!
            </p>
          </div>
        )}
      </div>

      {/* Transaction History Log */}
      <h2 className="section-title">📜 Transaction Audit Ledger</h2>
      <div className="watchlist-table-container">
        {transactions && transactions.length > 0 ? (
          <table className="watchlist-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Execution Price</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <span className={`watchlist-badge ${tx.type === "BUY" ? "rec-buy" : "rec-sell"}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td>
                    <strong>{tx.symbol}</strong>
                  </td>
                  <td>{tx.shares}</td>
                  <td>${tx.price?.toFixed(2)}</td>
                  <td>${(tx.shares * tx.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="watchlist-empty">No transactions executed yet.</div>
        )}
      </div>

      {/* Quick Trade Modal */}
      {tradeModalStock && (
        <TradingModal
          isOpen={!!tradeModalStock}
          onClose={() => setTradeModalStock(null)}
          symbol={tradeModalStock.symbol}
          companyName={tradeModalStock.companyName}
          currentPrice={tradeModalStock.currentPrice}
          userBalance={balance}
          onTradeComplete={() => fetchPortfolio()}
        />
      )}
    </div>
  );
}

export default PortfolioDashboard;
