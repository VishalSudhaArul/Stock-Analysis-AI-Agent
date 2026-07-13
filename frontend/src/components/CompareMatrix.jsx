import React, { useState } from "react";

function CompareMatrix({ currentResult, watchlist, onCompareSelect }) {
  const [compareResult, setCompareResult] = useState(null);

  if (!currentResult) return null;

  const currentStock = currentResult.marketData;
  const currentAnalysis = currentResult.analysis;
  const currentMarketAnalysis = currentResult.marketAnalysis;
  const currentSentimentAnalysis = currentResult.sentimentAnalysis;

  // Filter watchlist to find stocks with stored full analysis (if any) or simply show list to let user trigger load
  const availableCompareStocks = watchlist.filter(
    (item) => item.symbol !== currentStock.symbol
  );

  const handleSelectCompare = (e) => {
    const symbol = e.target.value;
    if (!symbol) {
      setCompareResult(null);
      return;
    }
    const matched = watchlist.find((item) => item.symbol === symbol);
    if (matched && matched.fullData) {
      setCompareResult(matched.fullData);
    } else {
      // If it doesn't have full data cached, trigger callback to fetch it
      if (matched) {
        onCompareSelect(matched.companyName || matched.symbol);
      }
    }
  };

  const formatMarketCap = (num) => {
    if (!num) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const getRecommendationBadgeStyle = (rec) => {
    if (!rec) return {};
    const r = rec.toUpperCase();
    if (r.includes("BUY")) return { backgroundColor: "rgba(16, 185, 129, 0.15)", color: "var(--positive)", border: "1px solid rgba(16, 185, 129, 0.3)" };
    if (r.includes("SELL")) return { backgroundColor: "rgba(239, 68, 68, 0.15)", color: "var(--negative)", border: "1px solid rgba(239, 68, 68, 0.3)" };
    return { backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "1px solid rgba(245, 158, 11, 0.3)" };
  };

  return (
    <div className="compare-matrix-container animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', marginBottom: '20px' }}>
        <h2 className="card-title" style={{ fontSize: '1.4rem' }}>📊 Stock Comparison Matrix</h2>
        
        {availableCompareStocks.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Compare with:</span>
            <select 
              onChange={handleSelectCompare}
              style={{
                background: 'var(--bg-color)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-main)',
                padding: '6px 12px',
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Select Watchlist Stock --</option>
              {availableCompareStocks.map((item) => (
                <option key={item.symbol} value={item.symbol}>
                  {item.companyName} ({item.symbol})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add more stocks to watchlist to unlock comparison.</span>
        )}
      </div>

      <div className="compare-grid">
        {/* Metric Headers Column */}
        <div className="compare-col header-col">
          <div className="compare-row-val" style={{ fontWeight: '600', color: 'var(--text-heading)' }}>Metric</div>
          <div className="compare-row-val">Ticker Symbol</div>
          <div className="compare-row-val">Current Price</div>
          <div className="compare-row-val">AI Recommendation</div>
          <div className="compare-row-val">CIO Confidence Score</div>
          <div className="compare-row-val">Financial Health Score</div>
          <div className="compare-row-val">News Sentiment Score</div>
          <div className="compare-row-val">P/E Ratio</div>
          <div className="compare-row-val">EPS (TTM)</div>
          <div className="compare-row-val">Market Cap</div>
          <div className="compare-row-val">Industry / Sector</div>
        </div>

        {/* Current Stock Column */}
        <div className="compare-col" style={{ border: '1px solid var(--accent-primary)', background: 'rgba(59, 130, 246, 0.03)' }}>
          <div className="compare-row-val" style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>
            {currentAnalysis.company} (Active)
          </div>
          <div className="compare-row-val" style={{ fontWeight: '500' }}>{currentStock.symbol}</div>
          <div className="compare-row-val" style={{ fontWeight: '600' }}>
            {currentStock.currency === "INR" ? "₹" : "$"}{currentStock.currentPrice?.toFixed(2) || "N/A"}
          </div>
          <div className="compare-row-val">
            <span className="watchlist-badge" style={getRecommendationBadgeStyle(currentAnalysis.recommendation)}>
              {currentAnalysis.recommendation}
            </span>
          </div>
          <div className="compare-row-val" style={{ fontWeight: '600' }}>{currentAnalysis.confidence}%</div>
          <div className="compare-row-val" style={{ fontWeight: '600' }}>
            {currentMarketAnalysis?.financialScore !== undefined ? `${currentMarketAnalysis.financialScore}/100` : "N/A"}
          </div>
          <div className="compare-row-val" style={{ fontWeight: '600' }}>
            {currentSentimentAnalysis?.sentimentScore !== undefined ? `${currentSentimentAnalysis.sentimentScore}/100` : "N/A"}
          </div>
          <div className="compare-row-val">{currentStock.peRatio?.toFixed(2) || "N/A"}</div>
          <div className="compare-row-val">{currentStock.eps?.toFixed(2) || "N/A"}</div>
          <div className="compare-row-val">{formatMarketCap(currentStock.marketCap)}</div>
          <div className="compare-row-val" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentStock.sector || "N/A"}
          </div>
        </div>

        {/* Comparison Stock Column */}
        {compareResult ? (
          <div className="compare-col" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            <div className="compare-row-val" style={{ fontWeight: '700', color: 'var(--text-heading)' }}>
              {compareResult.analysis.company}
            </div>
            <div className="compare-row-val" style={{ fontWeight: '500' }}>{compareResult.marketData.symbol}</div>
            <div className="compare-row-val" style={{ fontWeight: '600' }}>
              {compareResult.marketData.currency === "INR" ? "₹" : "$"}{compareResult.marketData.currentPrice?.toFixed(2) || "N/A"}
            </div>
            <div className="compare-row-val">
              <span className="watchlist-badge" style={getRecommendationBadgeStyle(compareResult.analysis.recommendation)}>
                {compareResult.analysis.recommendation}
              </span>
            </div>
            <div className="compare-row-val" style={{ fontWeight: '600' }}>{compareResult.analysis.confidence}%</div>
            <div className="compare-row-val" style={{ fontWeight: '600' }}>
              {compareResult.marketAnalysis?.financialScore !== undefined ? `${compareResult.marketAnalysis.financialScore}/100` : "N/A"}
            </div>
            <div className="compare-row-val" style={{ fontWeight: '600' }}>
              {compareResult.sentimentAnalysis?.sentimentScore !== undefined ? `${compareResult.sentimentAnalysis.sentimentScore}/100` : "N/A"}
            </div>
            <div className="compare-row-val">{compareResult.marketData.peRatio?.toFixed(2) || "N/A"}</div>
            <div className="compare-row-val">{compareResult.marketData.eps?.toFixed(2) || "N/A"}</div>
            <div className="compare-row-val">{formatMarketCap(compareResult.marketData.marketCap)}</div>
            <div className="compare-row-val" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {compareResult.marketData.sector || "N/A"}
            </div>
          </div>
        ) : (
          <div className="compare-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', borderStyle: 'dashed' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚖️</div>
            <span style={{ fontSize: '0.95rem' }}>Select a stock above to compare side-by-side</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompareMatrix;
