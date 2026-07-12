const StockCard = ({ stock }) => {
  if (!stock) return null;

  const formatPrice = (val) => {
    if (val === null || val === undefined) return "N/A";
    const symbolMap = { USD: "$", INR: "₹", EUR: "€", GBP: "£" };
    const prefix = symbolMap[stock.currency] || "$";
    return `${prefix}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (num) => {
    if (!num) return "N/A";
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)} T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)} B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)} M`;
    return num.toLocaleString();
  };

  const dailyChange = stock.currentPrice - stock.previousClose;
  const dailyChangePercent = stock.previousClose ? (dailyChange / stock.previousClose) * 100 : 0;
  const isPositive = dailyChange >= 0;

  return (
    <div className="card col-half animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
        <h2 className="card-title" style={{ flexGrow: 1 }}>📈 Live Market Data</h2>
        <span className="tag" style={{ margin: 0, fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
          {stock.dataSource || "Google Finance"}
        </span>
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-label">Symbol</div>
          <div className="metric-value" style={{ color: "var(--accent-primary)" }}>
            {stock.symbol}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 'normal' }}>
              {stock.exchange}
            </span>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Current Price</div>
          <div className="metric-value">
            {formatPrice(stock.currentPrice)}
            <span 
              className={`chart-price-diff ${isPositive ? "diff-up" : "diff-down"}`}
              style={{ display: 'block', fontSize: '0.8rem', marginTop: '2px', fontWeight: '500' }}
            >
              {isPositive ? "▲" : "▼"} {dailyChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Previous Close</div>
          <div className="metric-value">{formatPrice(stock.previousClose)}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Market Cap</div>
          <div className="metric-value">{formatMarketCap(stock.marketCap)}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">P/E Ratio</div>
          <div className="metric-value">{stock.peRatio !== null ? stock.peRatio : "N/A"}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">EPS</div>
          <div className="metric-value">{stock.eps !== null ? stock.eps : "N/A"}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">52W High</div>
          <div className="metric-value" style={{ fontSize: '1.15rem' }}>{formatPrice(stock.fiftyTwoWeekHigh)}</div>
        </div>

        <div className="metric-item">
          <div className="metric-label">52W Low</div>
          <div className="metric-value" style={{ fontSize: '1.15rem' }}>{formatPrice(stock.fiftyTwoWeekLow)}</div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;