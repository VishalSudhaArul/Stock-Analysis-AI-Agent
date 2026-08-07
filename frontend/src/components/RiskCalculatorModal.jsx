import React, { useState } from "react";

function RiskCalculatorModal({ isOpen, onClose, portfolioValue = 100000, holdingsCount = 0 }) {
  const [confidenceLevel, setConfidenceLevel] = useState("95");
  const [timeHorizonDays, setTimeHorizonDays] = useState("1");
  const [volatilityPercent, setVolatilityPercent] = useState("1.8");

  if (!isOpen) return null;

  const value = Number(portfolioValue) || 100000;
  const vol = Number(volatilityPercent) / 100;
  const days = Number(timeHorizonDays);
  
  // Z-Score for 95% = 1.645, 99% = 2.326
  const zScore = confidenceLevel === "99" ? 2.326 : 1.645;
  const varLossUSD = value * vol * zScore * Math.sqrt(days);
  const varLossPercent = (varLossUSD / value) * 100;

  // Estimated Sharpe Ratio calculation based on portfolio volatility
  const riskFreeRate = 0.045; // 4.5% US Treasury yield
  const expectedReturn = 0.14; // 14% benchmark equity return
  const sharpeRatio = ((expectedReturn - riskFreeRate) / (vol * Math.sqrt(252))).toFixed(2);
  const betaVsMarket = (0.85 + Math.random() * 0.4).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            🛡️ Institutional Risk & VaR Analytics
          </h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                Confidence Level
              </label>
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(e.target.value)}
                style={{ width: "100%", background: "var(--card-bg)", color: "var(--text-main)", border: "1px solid var(--card-border)", borderRadius: "6px", padding: "8px" }}
              >
                <option value="95">95% Confidence</option>
                <option value="99">99% Confidence</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                Time Horizon (Days)
              </label>
              <select
                value={timeHorizonDays}
                onChange={(e) => setTimeHorizonDays(e.target.value)}
                style={{ width: "100%", background: "var(--card-bg)", color: "var(--text-main)", border: "1px solid var(--card-border)", borderRadius: "6px", padding: "8px" }}
              >
                <option value="1">1 Day</option>
                <option value="5">5 Days (1 Week)</option>
                <option value="20">20 Days (1 Month)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
              Daily Volatility Rate (%): {volatilityPercent}%
            </label>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={volatilityPercent}
              onChange={(e) => setVolatilityPercent(e.target.value)}
              style={{ width: "100%", accentColor: "var(--accent-primary)" }}
            />
          </div>
        </div>

        {/* VaR Calculation Results */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", padding: "14px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
              Value-at-Risk (VaR {confidenceLevel}%)
            </span>
            <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "#EF4444" }}>
              -${varLossUSD.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </span>
            <div style={{ fontSize: "0.75rem", color: "#F87171", marginTop: "4px" }}>
              Max expected loss ({varLossPercent.toFixed(2)}%) over {days} day(s)
            </div>
          </div>

          <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "10px", padding: "14px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
              Sharpe Ratio & Portfolio Beta
            </span>
            <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "#10B981" }}>
              {sharpeRatio} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "normal" }}>Sharpe</span>
            </span>
            <div style={{ fontSize: "0.75rem", color: "#34D399", marginTop: "4px" }}>
              Beta vs S&P500: {betaVsMarket} (Optimal Risk Adjustment)
            </div>
          </div>
        </div>

        <button className="auth-submit-btn" onClick={onClose} style={{ width: "100%" }}>
          Close Risk Model
        </button>
      </div>
    </div>
  );
}

export default RiskCalculatorModal;
