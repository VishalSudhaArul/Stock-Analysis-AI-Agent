import { useState, useEffect } from "react";
import { runBacktestApi } from "../services/api";

function StrategyBacktester() {
  const [selectedStrategy, setSelectedStrategy] = useState("ai_momentum");
  const [timeframe, setTimeframe] = useState("3y");
  const [backtestData, setBacktestData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBacktest() {
      setLoading(true);
      try {
        const res = await runBacktestApi(selectedStrategy, timeframe);
        if (res.success) {
          setBacktestData(res.data);
        }
      } catch (err) {
        console.warn("Backtest fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadBacktest();
  }, [selectedStrategy, timeframe]);

  const strategies = [
    { key: "ai_momentum", label: "🤖 AI Sentiment Momentum" },
    { key: "value_investing", label: "🏰 Buffett Deep Value" },
    { key: "dividend_growth", label: "💰 Dividend Compounder" },
    { key: "volatility_breakout", label: "⚡ Volatility Breakout" },
  ];

  const timeframes = [
    { key: "1y", label: "1 Year" },
    { key: "3y", label: "3 Years" },
    { key: "5y", label: "5 Years" },
  ];

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
      <div className="card-header" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>📈</span>
          <div>
            <h2 className="card-title">AI Quant Backtester & Strategy Simulator</h2>
            <p className="card-subtitle">Backtest multi-factor algorithmic trading strategies against historic tick data</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {timeframes.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`action-btn ${timeframe === tf.key ? "primary" : ""}`}
              style={{ padding: "4px 10px", fontSize: "0.8rem", borderRadius: "6px" }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy selector buttons */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "8px", margin: "14px 0" }}>
        {strategies.map((strat) => (
          <button
            key={strat.key}
            onClick={() => setSelectedStrategy(strat.key)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: selectedStrategy === strat.key ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
              background: selectedStrategy === strat.key ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.03)",
              color: selectedStrategy === strat.key ? "#60a5fa" : "var(--text-main)",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            {strat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
          <span className="spinner"></span> Simulating Monte Carlo Quantitative Execution...
        </div>
      ) : backtestData ? (
        <div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "16px", borderRadius: "10px", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "4px", color: "var(--text-main)" }}>{backtestData.title}</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>{backtestData.description}</p>
          </div>

          {/* Performance metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "20px" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Strategy Return</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#10b981" }}>{backtestData.totalReturn}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>S&P 500 Benchmark</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-main)" }}>{backtestData.benchmarkReturn}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Annualized CAGR</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#60a5fa" }}>{backtestData.cagr}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sharpe Ratio</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#a855f7" }}>{backtestData.sharpeRatio}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Max Drawdown</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#f87171" }}>{backtestData.maxDrawdown}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Win Rate</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#34d399" }}>{backtestData.winRate}</div>
            </div>
          </div>

          {/* Equity growth chart representation */}
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.85rem" }}>
              <span style={{ color: "#60a5fa", fontWeight: "600" }}>🔵 AI Strategy Portfolio ($10k initial)</span>
              <span style={{ color: "var(--text-muted)" }}>⚪ Benchmark S&P 500 Index</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "flex-end", height: "140px", gap: "6px", overflowX: "auto", paddingTop: "20px" }}>
              {backtestData.equityCurve?.map((pt, index) => {
                const maxVal = Math.max(...backtestData.equityCurve.map(x => x.strategyValue));
                const heightPct = Math.max(15, Math.round((pt.strategyValue / maxVal) * 100));
                const benchPct = Math.max(10, Math.round((pt.benchmarkValue / maxVal) * 100));

                return (
                  <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: "12px" }} title={`${pt.month}: Strategy $${pt.strategyValue} | Bench $${pt.benchmarkValue}`}>
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                      <div style={{ width: "60%", height: `${heightPct}%`, background: "#3b82f6", borderRadius: "3px 3px 0 0" }}></div>
                      <div style={{ width: "40%", height: `${benchPct}%`, background: "rgba(255,255,255,0.2)", borderRadius: "3px 3px 0 0" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default StrategyBacktester;
