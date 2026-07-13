import React from "react";

function Watchlist({ watchlist, onAnalyze, onRemove }) {
  const getRecommendationBadgeStyle = (rec) => {
    if (!rec) return {};
    const r = rec.toUpperCase();
    if (r.includes("BUY")) return { backgroundColor: "rgba(16, 185, 129, 0.15)", color: "var(--positive)", border: "1px solid rgba(16, 185, 129, 0.3)" };
    if (r.includes("SELL")) return { backgroundColor: "rgba(239, 68, 68, 0.15)", color: "var(--negative)", border: "1px solid rgba(239, 68, 68, 0.3)" };
    return { backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11, 0.3)" };
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2 className="section-title">⭐ Investment Watchlist</h2>
      
      <div className="watchlist-table-container">
        {watchlist.length === 0 ? (
          <div className="watchlist-empty">
            Your watchlist is empty. Search for a company and add it to your watchlist to track it here.
          </div>
        ) : (
          <table className="watchlist-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company Name</th>
                <th>AI Signal</th>
                <th>Confidence</th>
                <th>Price</th>
                <th>Added On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((stock) => (
                <tr key={stock.symbol} className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <td style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{stock.symbol}</td>
                  <td>{stock.companyName}</td>
                  <td>
                    <span className="watchlist-badge" style={getRecommendationBadgeStyle(stock.recommendation)}>
                      {stock.recommendation}
                    </span>
                  </td>
                  <td style={{ fontWeight: '500' }}>{stock.confidence}%</td>
                  <td style={{ fontWeight: '600' }}>
                    {stock.currency === "INR" ? "₹" : "$"}{stock.price?.toFixed(2) || "N/A"}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(stock.addedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="watchlist-btn-actions">
                      <button 
                        className="table-btn"
                        onClick={() => onAnalyze(stock.companyName || stock.symbol)}
                        title="Analyze again"
                      >
                        🔍 Re-Analyze
                      </button>
                      <button 
                        className="table-btn delete"
                        onClick={() => onRemove(stock.symbol)}
                        title="Remove from watchlist"
                      >
                        ❌ Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Watchlist;
