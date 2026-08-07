import { useState, useEffect } from "react";
import { calculateDCFApi } from "../services/api";

function DCFValuationCalculator({ marketData }) {
  const symbol = marketData?.symbol || "AAPL";
  const currency = marketData?.currency || "USD";
  const currentPrice = marketData?.currentPrice || 220;

  const [fcf, setFcf] = useState(100);
  const [fcfGrowth, setFcfGrowth] = useState(12);
  const [discountRate, setDiscountRate] = useState(9);
  const [terminalRate, setTerminalRate] = useState(2.5);
  const [sharesOutstanding, setSharesOutstanding] = useState(15.5);
  const [dcfResult, setDcfResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function computeDCF() {
      setLoading(true);
      try {
        const res = await calculateDCFApi({
          symbol,
          fcf,
          fcfGrowth,
          discountRate,
          terminalRate,
          sharesOutstanding,
          currentPrice,
          currency,
        });
        if (res.success) {
          setDcfResult(res.data);
        }
      } catch (err) {
        console.warn("DCF Calculation warning:", err.message);
      } finally {
        setLoading(false);
      }
    }
    computeDCF();
  }, [symbol, fcf, fcfGrowth, discountRate, terminalRate, sharesOutstanding, currentPrice, currency]);

  const currencySymbol = currency === "INR" ? "₹" : "$";

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.22s" }}>
      <div className="card-header" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>🧮</span>
          <div>
            <h2 className="card-title">DCF Intrinsic Fair Value Model</h2>
            <p className="card-subtitle">Discounted Cash Flow 5-Year Valuation & Margin of Safety Calculator for {symbol}</p>
          </div>
        </div>

        {dcfResult && (
          <span className={`badge ${dcfResult.upsidePct > 15 ? 'badge-success' : dcfResult.upsidePct < -15 ? 'badge-danger' : 'badge-warning'}`} style={{ padding: "6px 12px", fontSize: "0.88rem" }}>
            {dcfResult.valuationStance}
          </span>
        )}
      </div>

      {/* Inputs grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", margin: "16px 0", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            Free Cash Flow (FCF) ({currencySymbol}B)
          </label>
          <input
            type="number"
            value={fcf}
            onChange={(e) => setFcf(Number(e.target.value))}
            className="search-input"
            style={{ width: "100%", padding: "8px" }}
            step="1"
          />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            Est. 5Y FCF Growth Rate (%): <strong>{fcfGrowth}%</strong>
          </label>
          <input
            type="range"
            min="1"
            max="40"
            value={fcfGrowth}
            onChange={(e) => setFcfGrowth(Number(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            Discount Rate (WACC %): <strong>{discountRate}%</strong>
          </label>
          <input
            type="range"
            min="4"
            max="18"
            step="0.5"
            value={discountRate}
            onChange={(e) => setDiscountRate(Number(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            Perpetual Growth (%): <strong>{terminalRate}%</strong>
          </label>
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.1"
            value={terminalRate}
            onChange={(e) => setTerminalRate(Number(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
            Shares Outstanding (B)
          </label>
          <input
            type="number"
            value={sharesOutstanding}
            onChange={(e) => setSharesOutstanding(Number(e.target.value))}
            className="search-input"
            style={{ width: "100%", padding: "8px" }}
            step="0.1"
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <span className="spinner"></span> Re-evaluating Gordon Growth Model & WACC Discounting...
        </div>
      ) : dcfResult ? (
        <div>
          {/* Main Fair Value & Scenarios */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid #3b82f6", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current Market Price</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-main)" }}>
                {currencySymbol}{dcfResult.currentPrice}
              </div>
            </div>

            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Intrinsic Fair Value</div>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#10b981" }}>
                {currencySymbol}{dcfResult.fairValuePerShare}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Upside / Margin Safety</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: dcfResult.upsidePct >= 0 ? "#10b981" : "#ef4444" }}>
                {dcfResult.upsidePct >= 0 ? `+${dcfResult.upsidePct}%` : `${dcfResult.upsidePct}%`}
              </div>
            </div>
          </div>

          {/* Bear / Base / Bull Target Prices */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.3)", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#f87171" }}>🐻 Bear Case Target</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f87171" }}>{currencySymbol}{dcfResult.scenarios.bear}</div>
            </div>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.3)", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#60a5fa" }}>🎯 Base Case Target</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#60a5fa" }}>{currencySymbol}{dcfResult.scenarios.base}</div>
            </div>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#34d399" }}>🐂 Bull Case Target</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#34d399" }}>{currencySymbol}{dcfResult.scenarios.bull}</div>
            </div>
          </div>

          {/* Projected Cash Flows Table */}
          <h3 style={{ fontSize: "0.95rem", margin: "14px 0 8px 0", color: "var(--text-muted)" }}>5-Year Discounted FCF Cashflow Table ({currencySymbol}B)</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "6px" }}>Period</th>
                  <th style={{ padding: "6px" }}>Projected FCF</th>
                  <th style={{ padding: "6px" }}>Present Discounted FCF</th>
                </tr>
              </thead>
              <tbody>
                {dcfResult.projectedYears?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "8px 6px", fontWeight: "600" }}>{item.year}</td>
                    <td style={{ padding: "8px 6px" }}>{currencySymbol}{item.fcf}B</td>
                    <td style={{ padding: "8px 6px", color: "#60a5fa" }}>{currencySymbol}{item.discountedFCF}B</td>
                  </tr>
                ))}
                <tr style={{ background: "rgba(255,255,255,0.03)", fontWeight: "700" }}>
                  <td style={{ padding: "8px 6px" }}>Terminal Value (Discounted)</td>
                  <td style={{ padding: "8px 6px" }}>-</td>
                  <td style={{ padding: "8px 6px", color: "#a855f7" }}>{currencySymbol}{dcfResult.discountedTerminalValue}B</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DCFValuationCalculator;
