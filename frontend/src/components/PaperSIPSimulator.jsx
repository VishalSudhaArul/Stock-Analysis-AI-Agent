import React, { useState } from "react";

function PaperSIPSimulator({ holdings = [], displayCurrency = "USD", curSymbol = "$", multiplier = 1.0 }) {
  const [selectedStock, setSelectedStock] = useState(holdings[0]?.symbol || "AAPL");
  const [monthlyAmount, setMonthlyAmount] = useState(500);
  const [sipDurationMonths, setSipDurationMonths] = useState(12);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12); // 12% annual return

  // Calculate compound SIP returns formula
  const monthlyRate = expectedReturnRate / 12 / 100;
  const totalInvested = monthlyAmount * sipDurationMonths;
  const projectedFutureValue = Math.round(
    monthlyAmount * (((Math.pow(1 + monthlyRate, sipDurationMonths) - 1) / monthlyRate) * (1 + monthlyRate))
  );
  const projectedEstimatedProfit = Math.max(0, projectedFutureValue - totalInvested);

  // Sector Heatmap calculation
  const sectorColors = {
    Technology: "linear-gradient(135deg, #1E3A8A, #3B82F6)",
    Healthcare: "linear-gradient(135deg, #064E3B, #10B981)",
    Infrastructure: "linear-gradient(135deg, #78350F, #F59E0B)",
    Automotive: "linear-gradient(135deg, #4C1D95, #8B5CF6)",
    Energy: "linear-gradient(135deg, #831843, #EC4899)",
    "Diversified Equities": "linear-gradient(135deg, #374151, #6B7280)",
  };

  const sectorMap = {
    AAPL: "Technology",
    NVDA: "Technology",
    INFY: "Technology",
    TCS: "Technology",
    CIPLA: "Healthcare",
    IRFC: "Infrastructure",
    TATAMOTORS: "Automotive",
    RELIANCE: "Energy",
    TSLA: "Automotive",
  };

  const sectorGroups = {};
  holdings.forEach((h) => {
    const sec = sectorMap[h.symbol.toUpperCase()] || "Diversified Equities";
    if (!sectorGroups[sec]) sectorGroups[sec] = [];
    sectorGroups[sec].push(h);
  });

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.3s", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            🔄 Paper SIP Calculator & Interactive Sector Heatmap
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Simulate monthly compounding wealth accumulation & portfolio heat distribution
          </span>
        </div>
        <span className="watchlist-badge rec-buy">
          ⚡ Compound Growth Simulator
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {/* SIP Calculator Controls */}
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--text-heading)", marginBottom: "14px" }}>
            ⚙️ SIP Investment Parameters
          </h3>

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label className="form-label">Monthly Investment Amount ({curSymbol})</label>
            <input
              type="number"
              className="form-input"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              min={50}
              step={50}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label className="form-label">SIP Tenure (Months): {sipDurationMonths} Months ({(sipDurationMonths / 12).toFixed(1)} Yrs)</label>
            <input
              type="range"
              min={6}
              max={60}
              step={6}
              value={sipDurationMonths}
              onChange={(e) => setSipDurationMonths(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent-primary)" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label className="form-label">Expected Annual Return Rate (%): {expectedReturnRate}%</label>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#10B981" }}
            />
          </div>

          <div style={{ marginTop: "16px", padding: "14px", background: "rgba(59, 130, 246, 0.1)", borderRadius: "10px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <span>Total Outlay Invested:</span>
              <strong>{curSymbol}{(totalInvested * multiplier).toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#34D399", marginTop: "6px" }}>
              <span>Projected Wealth Gain:</span>
              <strong>+{curSymbol}{(projectedEstimatedProfit * multiplier).toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: "700", color: "var(--text-heading)", marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
              <span>Future Value ({displayCurrency}):</span>
              <span style={{ color: "var(--accent-primary)" }}>{curSymbol}{(projectedFutureValue * multiplier).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Sector Visual Heatmap Treemap */}
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--text-heading)", marginBottom: "14px" }}>
            🗺️ Portfolio Sector Heatmap Treemap
          </h3>

          {Object.keys(sectorGroups).length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.entries(sectorGroups).map(([secName, secHoldings]) => (
                <div
                  key={secName}
                  style={{
                    background: sectorColors[secName] || sectorColors["Diversified Equities"],
                    padding: "14px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    color: "#fff",
                  }}
                >
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span>{secName}</span>
                    <span>{secHoldings.length} {secHoldings.length === 1 ? "Stock" : "Stocks"}</span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {secHoldings.map((h) => {
                      const pnl = h.pnlPercent ?? 0;
                      const isUp = pnl >= 0;
                      return (
                        <div
                          key={h.symbol}
                          style={{
                            background: "rgba(0, 0, 0, 0.3)",
                            backdropFilter: "blur(4px)",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: `1px solid ${isUp ? "rgba(52, 211, 153, 0.4)" : "rgba(248, 113, 113, 0.4)"}`,
                            fontSize: "0.8rem",
                          }}
                        >
                          <strong>{h.symbol}</strong>: <span style={{ color: isUp ? "#34D399" : "#F87171" }}>{isUp ? "+" : ""}{pnl.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
              No active holdings to display on sector heatmap.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaperSIPSimulator;
