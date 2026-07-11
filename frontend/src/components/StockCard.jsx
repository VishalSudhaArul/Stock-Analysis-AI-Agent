const StockCard = ({ stock }) => {
  if (!stock) return null;

  return (
    <div className="card col-half animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="card-header">
        <h2 className="card-title">📈 Live Market Data</h2>
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-label">Symbol</div>
          <div className="metric-value" style={{ color: "var(--accent-primary)" }}>{stock.symbol}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Current Price</div>
          <div className="metric-value">${stock.currentPrice}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Previous Close</div>
          <div className="metric-value">${stock.previousClose}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Market Cap</div>
          <div className="metric-value">{(stock.marketCap / 1e12).toFixed(2)} T</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">P/E Ratio</div>
          <div className="metric-value">{stock.peRatio}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">EPS</div>
          <div className="metric-value">{stock.eps}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">52W High</div>
          <div className="metric-value">${stock.fiftyTwoWeekHigh}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">52W Low</div>
          <div className="metric-value">${stock.fiftyTwoWeekLow}</div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;