import React, { useState } from "react";

const DIVIDEND_DATABASE = {
  AAPL: { yield: 0.52, payoutRatio: 15, frequency: "Quarterly", safety: "Safe (Aristocrat Candidate)" },
  NVDA: { yield: 0.08, payoutRatio: 4, frequency: "Quarterly", safety: "Very Safe" },
  INFY: { yield: 2.45, payoutRatio: 62, frequency: "Semi-Annual", safety: "Safe & Stable" },
  TCS: { yield: 1.85, payoutRatio: 58, frequency: "Quarterly", safety: "Very Safe" },
  RELIANCE: { yield: 0.45, payoutRatio: 18, frequency: "Annual", safety: "Safe" },
  CIPLA: { yield: 0.95, payoutRatio: 22, frequency: "Annual", safety: "Safe" },
  IRFC: { yield: 3.10, payoutRatio: 35, frequency: "Semi-Annual", safety: "Government Backed" },
  TATAMOTORS: { yield: 1.20, payoutRatio: 20, frequency: "Annual", safety: "Moderate" },
  TSLA: { yield: 0.00, payoutRatio: 0, frequency: "None", safety: "N/A (Growth Reinvestment)" },
  MSFT: { yield: 0.72, payoutRatio: 26, frequency: "Quarterly", safety: "Ultra Safe" },
  KO: { yield: 3.15, payoutRatio: 68, frequency: "Quarterly", safety: "Dividend Aristocrat (50+ Yrs)" },
  JNJ: { yield: 3.05, payoutRatio: 65, frequency: "Quarterly", safety: "Dividend King (60+ Yrs)" },
  O: { yield: 5.60, payoutRatio: 78, frequency: "Monthly", safety: "Monthly Dividend REIT" },
};

function DividendYieldCalculator({ holdings = [], displayCurrency = "USD", curSymbol = "$", multiplier = 1.0 }) {
  const [dripYears, setDripYears] = useState(5);
  const [dripEnabled, setDripEnabled] = useState(true);
  const [annualDividendGrowthRate, setAnnualDividendGrowthRate] = useState(5);

  // Compute portfolio estimated annual dividend income
  let totalPortfolioAnnualDividendUSD = 0;

  const holdingsDividendDetails = holdings.map((h) => {
    const sym = h.symbol.toUpperCase();
    const isIndian = h.currency === "INR" || sym.endsWith(".NS") || sym.includes(":NSE");
    const valInUSD = h.currentValueUSD !== undefined ? h.currentValueUSD : (isIndian ? (h.currentValue || 0) / 83.5 : (h.currentValue || 0));
    
    const divInfo = DIVIDEND_DATABASE[sym] || {
      yield: 1.5,
      payoutRatio: 35,
      frequency: "Quarterly",
      safety: "Standard Market Avg",
    };

    const annualPayoutUSD = valInUSD * (divInfo.yield / 100);
    totalPortfolioAnnualDividendUSD += annualPayoutUSD;

    return {
      symbol: h.symbol,
      companyName: h.companyName || h.symbol,
      positionValueUSD: valInUSD,
      yieldPercent: divInfo.yield,
      annualPayoutUSD,
      frequency: divInfo.frequency,
      safety: divInfo.safety,
    };
  });

  const portfolioYieldPercent =
    holdings.reduce((sum, h) => sum + ((h.currentValueUSD !== undefined ? h.currentValueUSD : (h.currency === "INR" ? h.currentValue / 83.5 : h.currentValue)) || 0), 0) > 0
      ? (totalPortfolioAnnualDividendUSD /
          holdings.reduce((sum, h) => sum + ((h.currentValueUSD !== undefined ? h.currentValueUSD : (h.currency === "INR" ? h.currentValue / 83.5 : h.currentValue)) || 0), 0)) *
        100
      : 0;

  // Simulate DRIP compounding
  let cumulativeDividendsUSD = 0;
  let simulatedCapitalUSD = holdings.reduce((sum, h) => sum + ((h.currentValueUSD !== undefined ? h.currentValueUSD : (h.currency === "INR" ? h.currentValue / 83.5 : h.currentValue)) || 0), 0);
  let currentYield = portfolioYieldPercent || 2.0;

  for (let year = 1; year <= dripYears; year++) {
    const yearDividendUSD = simulatedCapitalUSD * (currentYield / 100);
    cumulativeDividendsUSD += yearDividendUSD;
    if (dripEnabled) {
      simulatedCapitalUSD += yearDividendUSD;
    }
    currentYield *= 1 + annualDividendGrowthRate / 100;
  }

  const monthlyIncomeUSD = totalPortfolioAnnualDividendUSD / 12;

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.4s", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            💎 Passive Dividend Yield & DRIP Compounding Forecast
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Project annual cash flows, dividend growth rates & Dividend Reinvestment Plan (DRIP) compounding
          </span>
        </div>
        <span className="watchlist-badge rec-buy">
          💵 Passive Cash Flow Engine
        </span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>Est. Annual Passive Income</div>
          <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#10B981" }}>
            {curSymbol}{(totalPortfolioAnnualDividendUSD * multiplier).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Avg Yield: {portfolioYieldPercent.toFixed(2)}%
          </div>
        </div>

        <div style={{ background: "rgba(59, 130, 246, 0.08)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>Est. Monthly Cash Flow</div>
          <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--accent-primary)" }}>
            {curSymbol}{(monthlyIncomeUSD * multiplier).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            {curSymbol}{((monthlyIncomeUSD * multiplier) / 30).toFixed(2)} / day
          </div>
        </div>

        <div style={{ background: "rgba(139, 92, 246, 0.08)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>{dripYears}-Year Cumulative Payout</div>
          <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#A78BFA" }}>
            {curSymbol}{(cumulativeDividendsUSD * multiplier).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Mode: {dripEnabled ? "🔄 DRIP Reinvested" : "💰 Cash Payout"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* DRIP Controls */}
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--text-heading)", marginBottom: "14px" }}>
            ⚙️ DRIP Simulator Controls
          </h3>

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label className="form-label">Compounding Horizon: {dripYears} Years</label>
            <input
              type="range"
              min={1}
              max={15}
              step={1}
              value={dripYears}
              onChange={(e) => setDripYears(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent-primary)" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label className="form-label">Est. Annual Dividend Growth Rate (%): {annualDividendGrowthRate}%</label>
            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={annualDividendGrowthRate}
              onChange={(e) => setAnnualDividendGrowthRate(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#10B981" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
            <input
              type="checkbox"
              id="dripToggle"
              checked={dripEnabled}
              onChange={(e) => setDripEnabled(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "var(--accent-primary)", cursor: "pointer" }}
            />
            <label htmlFor="dripToggle" style={{ fontSize: "0.9rem", color: "var(--text-heading)", cursor: "pointer", fontWeight: 600 }}>
              Enable DRIP (Auto-Reinvest Dividends for Compound Growth)
            </label>
          </div>
        </div>

        {/* Breakdown by Holding */}
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--text-heading)", marginBottom: "14px" }}>
            📋 Portfolio Dividend Breakdown
          </h3>

          {holdingsDividendDetails.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "220px", overflowY: "auto" }}>
              {holdingsDividendDetails.map((h) => (
                <div
                  key={h.symbol}
                  style={{
                    display: "flex",
                    justify: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "8px",
                    border: "1px solid var(--card-border)",
                    fontSize: "0.85rem",
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--accent-primary)" }}>{h.symbol}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "8px" }}>
                      ({h.yieldPercent}% Yield | {h.frequency})
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "700", color: "#10B981" }}>
                      +{curSymbol}{(h.annualPayoutUSD * multiplier).toFixed(2)}/yr
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{h.safety}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No active holdings. Add stocks to preview passive dividend yields.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DividendYieldCalculator;
