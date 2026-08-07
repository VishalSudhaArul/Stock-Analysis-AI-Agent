import React, { useState } from "react";

const SCREENER_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", pe: "30.5", roe: "147%", score: 88, stance: "UNDERVALUED", price: "$224.50" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology", pe: "68.2", roe: "115%", score: 94, stance: "HIGH GROWTH", price: "$128.20" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology", pe: "34.8", roe: "38.5%", score: 86, stance: "FAIRLY VALUED", price: "$445.10" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology", pe: "22.4", roe: "29.1%", score: 85, stance: "UNDERVALUED", price: "$178.40" },
  { symbol: "INFY", name: "Infosys Ltd.", sector: "Technology", pe: "24.1", roe: "31.8%", score: 82, stance: "UNDERVALUED", price: "₹1,820.00" },
  { symbol: "TCS.NS", name: "Tata Consultancy", sector: "Technology", pe: "28.5", roe: "48.2%", score: 89, stance: "FAIRLY VALUED", price: "₹4,250.00" },
  { symbol: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy", pe: "26.4", roe: "12.4%", score: 80, stance: "FAIRLY VALUED", price: "₹3,010.00" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", sector: "Automotive", pe: "11.2", roe: "48.6%", score: 91, stance: "UNDERVALUED", price: "₹1,050.00" },
  { symbol: "CIPLA.NS", name: "Cipla Ltd.", sector: "Healthcare", pe: "28.1", roe: "18.5%", score: 84, stance: "UNDERVALUED", price: "₹1,540.00" },
  { symbol: "IRFC.NS", name: "Indian Railway Finance", sector: "Infrastructure", pe: "35.2", roe: "14.2%", score: 79, stance: "MOMENTUM", price: "₹178.50" },
];

function StockScreener({ onSearchStock }) {
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [minScore, setMinScore] = useState(80);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStocks = SCREENER_STOCKS.filter((stock) => {
    const matchesSector = selectedSector === "ALL" || stock.sector === selectedSector;
    const matchesScore = stock.score >= minScore;
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSector && matchesScore && matchesSearch;
  });

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.3s", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            🎯 Institutional Stock Screener
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Filter stocks by AI Smart Score, sector fundamentals, and valuation signals
          </span>
        </div>
        <span className="watchlist-badge rec-buy">
          🔍 {filteredStocks.length} Stocks Screened
        </span>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "16px", background: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "10px", border: "1px solid var(--card-border)" }}>
        <div style={{ flex: 1, minWidth: "180px" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Search Symbol or Company</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search AAPL, INFY, NVDA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "8px 12px", fontSize: "0.85rem" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Sector Filter</label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            style={{ background: "var(--card-bg)", color: "var(--text-main)", border: "1px solid var(--card-border)", borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem" }}
          >
            <option value="ALL">All Sectors</option>
            <option value="Technology">Technology</option>
            <option value="Energy">Energy</option>
            <option value="Automotive">Automotive</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
        </div>

        <div style={{ minWidth: "180px" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Min AI Score: {minScore}/100</label>
          <input
            type="range"
            min={70}
            max={95}
            step={1}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--accent-primary)" }}
          />
        </div>
      </div>

      {/* Screener Table */}
      <div className="watchlist-table-container">
        <table className="watchlist-table">
          <thead>
            <tr>
              <th>Symbol & Name</th>
              <th>Sector</th>
              <th>Live Price</th>
              <th>P/E Ratio</th>
              <th>ROE %</th>
              <th>AI Smart Score</th>
              <th>Valuation Stance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr key={stock.symbol}>
                <td>
                  <strong style={{ color: "var(--accent-primary)" }}>{stock.symbol}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{stock.name}</div>
                </td>
                <td>{stock.sector}</td>
                <td><strong>{stock.price}</strong></td>
                <td>{stock.pe}</td>
                <td>{stock.roe}</td>
                <td>
                  <span style={{ fontWeight: "700", color: stock.score >= 88 ? "#10B981" : "#60A5FA" }}>
                    {stock.score} / 100
                  </span>
                </td>
                <td>
                  <span className="watchlist-badge rec-buy" style={{ fontSize: "0.75rem" }}>
                    {stock.stance}
                  </span>
                </td>
                <td>
                  <button
                    className="table-btn"
                    onClick={() => onSearchStock(stock.symbol)}
                  >
                    ⚡ Analyze
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockScreener;
