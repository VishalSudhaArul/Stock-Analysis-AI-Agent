import React from "react";

const EARNINGS_EVENTS = [
  { symbol: "NVDA", name: "NVIDIA Corp.", date: "Aug 28, 2026", period: "Q2 2026", estEps: "$0.64", estRev: "$28.5B", status: "High Impact 🔥" },
  { symbol: "AAPL", name: "Apple Inc.", date: "Sep 05, 2026", period: "Q3 2026", estEps: "$1.35", estRev: "$84.2B", status: "Upcoming 📅" },
  { symbol: "INFY", name: "Infosys Ltd.", date: "Oct 12, 2026", period: "Q2 2027", estEps: "₹17.20", estRev: "₹41,200Cr", status: "Dividend 💰" },
  { symbol: "TCS.NS", name: "Tata Consultancy", date: "Oct 15, 2026", period: "Q2 2027", estEps: "₹34.50", estRev: "₹63,500Cr", status: "Upcoming 📅" },
  { symbol: "MSFT", name: "Microsoft Corp.", date: "Oct 24, 2026", period: "Q1 2027", estEps: "$3.10", estRev: "$64.8B", status: "High Impact 🔥" },
];

function EarningsCalendar({ onSearchStock }) {
  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.4s", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            📅 Corporate Earnings & Dividend Calendar
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Institutional consensus earnings forecasts, revenue estimates & dividend announcements
          </span>
        </div>
        <span className="watchlist-badge rec-buy">
          🔥 Earnings Season Tracker
        </span>
      </div>

      <div className="watchlist-table-container">
        <table className="watchlist-table">
          <thead>
            <tr>
              <th>Symbol & Company</th>
              <th>Report Date</th>
              <th>Fiscal Quarter</th>
              <th>Est. EPS</th>
              <th>Est. Revenue</th>
              <th>Event Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {EARNINGS_EVENTS.map((item) => (
              <tr key={item.symbol}>
                <td>
                  <strong style={{ color: "var(--accent-primary)" }}>{item.symbol}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.name}</div>
                </td>
                <td><strong>{item.date}</strong></td>
                <td>{item.period}</td>
                <td><strong style={{ color: "#34D399" }}>{item.estEps}</strong></td>
                <td>{item.estRev}</td>
                <td>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: item.status.includes("🔥") ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)",
                      color: item.status.includes("🔥") ? "#F87171" : "#60A5FA",
                    }}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <button className="table-btn" onClick={() => onSearchStock(item.symbol)}>
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

export default EarningsCalendar;
