import { useState, useRef } from "react";

const StockChart = ({ historicalData, currency = "USD" }) => {
  const [timeframe, setTimeframe] = useState("30D"); // 7D, 15D, 30D
  const [activeIndex, setActiveIndex] = useState(null);
  const containerRef = useRef(null);

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="chart-empty">
        <p>No historical data available for chart.</p>
      </div>
    );
  }

  // Filter data based on timeframe
  const getFilteredData = () => {
    if (timeframe === "7D") {
      return historicalData.slice(-7);
    } else if (timeframe === "15D") {
      return historicalData.slice(-15);
    }
    return historicalData;
  };

  const data = getFilteredData();
  const prices = data.map((d) => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Chart dimensions in SVG viewBox
  const width = 600;
  const height = 280;
  const paddingX = 50;
  const paddingY = 40;

  const usableWidth = width - 2 * paddingX;
  const usableHeight = height - 2 * paddingY;

  // Generate SVG coordinates for each data point
  const points = data.map((item, index) => {
    const x = paddingX + (index / (data.length - 1)) * usableWidth;
    // Y is inverted in SVG coordinate space
    const y = paddingY + (1 - (item.price - minPrice) / priceRange) * usableHeight;
    return { x, y, ...item };
  });

  // Create SVG path string
  const pathD = points.reduce((acc, point, index) => {
    return acc + `${index === 0 ? "M" : "L"} ${point.x} ${point.y} `;
  }, "");

  // Create SVG closed area path string for the gradient fill
  const areaD = pathD
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  // Determine trend and colors
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = (priceChange / firstPrice) * 100;
  const isPositive = priceChange >= 0;
  const trendColor = isPositive ? "var(--positive)" : "var(--negative)";
  const strokeGradientId = `chart-stroke-grad-${isPositive ? "up" : "down"}`;
  const fillGradientId = `chart-fill-grad-${isPositive ? "up" : "down"}`;

  // Handle Mouse Hover/Move
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    
    // Scale clientX to SVG viewBox space
    const svgX = (clientX / rect.width) * width;
    const percentX = (svgX - paddingX) / usableWidth;
    
    let index = Math.round(percentX * (data.length - 1));
    index = Math.max(0, Math.min(data.length - 1, index));
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Format currency value
  const formatPrice = (val) => {
    const symbolMap = { USD: "$", INR: "₹", EUR: "€", GBP: "£" };
    const prefix = symbolMap[currency] || "$";
    return `${prefix}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  // Grid lines
  const gridLinesY = [0.25, 0.5, 0.75].map((ratio) => {
    const y = paddingY + ratio * usableHeight;
    const value = maxPrice - ratio * priceRange;
    return { y, value };
  });

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
      <div className="chart-header-row">
        <div>
          <h2 className="card-title">📈 Stock Trend ({timeframe})</h2>
          <div className="chart-price-summary">
            <span className="chart-current-price">{formatPrice(lastPrice)}</span>
            <span className={`chart-price-diff ${isPositive ? "diff-up" : "diff-down"}`}>
              {isPositive ? "▲" : "▼"} {formatPrice(Math.abs(priceChange))} ({priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="timeframe-buttons">
          {["7D", "15D", "30D"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`time-btn ${timeframe === tf ? "active" : ""}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div
        className="chart-svg-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative", cursor: "crosshair" }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            {/* Stroke Gradient */}
            <linearGradient id={strokeGradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={isPositive ? "#34D399" : "#F87171"} />
              <stop offset="100%" stopColor={isPositive ? "#059669" : "#DC2626"} />
            </linearGradient>

            {/* Fill Gradient (Area below the curve) */}
            <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={trendColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {gridLinesY.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={line.y}
                x2={width - paddingX}
                y2={line.y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={line.y + 4}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="end"
              >
                {formatPrice(line.value)}
              </text>
            </g>
          ))}

          {/* X Axis Labels */}
          {points.length > 1 && (
            <>
              {/* Start Date */}
              <text
                x={paddingX}
                y={height - paddingY + 20}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="start"
              >
                {points[0].date}
              </text>
              
              {/* Mid Date */}
              <text
                x={width / 2}
                y={height - paddingY + 20}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="middle"
              >
                {points[Math.floor(points.length / 2)].date}
              </text>

              {/* End Date */}
              <text
                x={width - paddingX}
                y={height - paddingY + 20}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="end"
              >
                {points[points.length - 1].date}
              </text>
            </>
          )}

          {/* Area Path */}
          {areaD && <path d={areaD} fill={`url(#${fillGradientId})`} />}

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={`url(#${strokeGradientId})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Active Hover Element */}
          {activePoint && (
            <g>
              {/* Vertical Guide Line */}
              <line
                x1={activePoint.x}
                y1={paddingY}
                x2={activePoint.x}
                y2={height - paddingY}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeDasharray="3 3"
              />

              {/* Outer Glowing Dot */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7"
                fill={trendColor}
                fillOpacity="0.4"
              />
              
              {/* Inner Solid Dot */}
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill="#FFFFFF"
                stroke={trendColor}
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* HTML Tooltip overlay */}
        {activePoint && (
          <div
            className="chart-tooltip"
            style={{
              position: "absolute",
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100 - 65}%`,
              transform: "translateX(-50%)",
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "6px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              color: "#FFF",
              pointerEvents: "none",
              zIndex: 10,
              fontSize: "0.85rem",
              textAlign: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "2px" }}>
              {activePoint.date}
            </div>
            <div style={{ fontWeight: "600", color: trendColor }}>
              {formatPrice(activePoint.price)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockChart;
