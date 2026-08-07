import React from "react";

const ASSETS_DATA = [
  { symbol: "BTC", name: "Bitcoin", price: "$64,250.00", change: "+2.26%", isUp: true, type: "Crypto ₿" },
  { symbol: "ETH", name: "Ethereum", price: "$3,480.10", change: "+1.85%", isUp: true, type: "Crypto ₿" },
  { symbol: "SOL", name: "Solana", price: "$142.50", change: "+4.12%", isUp: true, type: "Crypto ₿" },
  { symbol: "USD/INR", name: "US Dollar / Indian Rupee", price: "₹83.75", change: "-0.06%", isUp: false, type: "Forex 💱" },
  { symbol: "EUR/USD", name: "Euro / US Dollar", price: "$1.0890", change: "+0.15%", isUp: true, type: "Forex 💱" },
  { symbol: "GBP/USD", name: "British Pound / USD", price: "$1.2940", change: "-0.10%", isUp: false, type: "Forex 💱" },
];

function CryptoForexTicker({ onSearchStock }) {
  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.5s", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            🪙 Multi-Asset Class Intel (Crypto & FX Rates)
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Real-time cross-asset sentiment & macroeconomic currency valuations
          </span>
        </div>
        <span className="watchlist-badge rec-buy">
          ⚡ 24/7 Global Asset Feed
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        {ASSETS_DATA.map((asset) => (
          <div
            key={asset.symbol}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--card-border)",
              borderRadius: "10px",
              padding: "12px 14px",
              transition: "transform 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>{asset.type}</span>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: asset.isUp ? "#34D399" : "#F87171" }}>
                {asset.isUp ? "▲" : "▼"} {asset.change}
              </span>
            </div>
            <div style={{ fontSize: "1rem", fontWeight: "700", color: "var(--accent-primary)" }}>{asset.symbol}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>{asset.name}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-heading)" }}>{asset.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CryptoForexTicker;
