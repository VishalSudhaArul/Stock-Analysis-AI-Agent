import React from "react";

const INDICES_DATA = [
  { name: "NIFTY 50", country: "🇮🇳", price: "24,680.50", change: "+142.30", percent: "+0.58%", isUp: true },
  { name: "SENSEX", country: "🇮🇳", price: "80,950.20", change: "+410.15", percent: "+0.51%", isUp: true },
  { name: "S&P 500", country: "🇺🇸", price: "5,520.40", change: "+34.12", percent: "+0.62%", isUp: true },
  { name: "NASDAQ", country: "🇺🇸", price: "17,390.80", change: "+185.60", percent: "+1.08%", isUp: true },
  { name: "FTSE 100", country: "🇬🇧", price: "8,180.10", change: "-12.40", percent: "-0.15%", isUp: false },
  { name: "NIKKEI 225", country: "🇯🇵", price: "38,450.00", change: "+290.00", percent: "+0.76%", isUp: true },
  { name: "BTC / USD", country: "🌐", price: "$64,250.00", change: "+1,420.00", percent: "+2.26%", isUp: true },
  { name: "USD / INR", country: "💱", price: "₹83.75", change: "-0.05", percent: "-0.06%", isUp: false },
];

function MarketIndicesTicker() {
  return (
    <div style={{ background: "rgba(15, 23, 42, 0.6)", borderBottom: "1px solid var(--card-border)", padding: "8px 0", overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", gap: "24px", overflowX: "auto", padding: "0 20px", scrollbarWidth: "none", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "1px", whiteSpace: "nowrap" }}>
          🌐 Global Markets & FX:
        </span>
        {INDICES_DATA.map((idx) => (
          <div key={idx.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
            <span>{idx.country}</span>
            <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{idx.name}:</span>
            <span style={{ color: "var(--text-heading)", fontWeight: "700" }}>{idx.price}</span>
            <span style={{ color: idx.isUp ? "#34D399" : "#F87171", fontWeight: "600" }}>
              {idx.isUp ? "▲" : "▼"} {idx.percent}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketIndicesTicker;
