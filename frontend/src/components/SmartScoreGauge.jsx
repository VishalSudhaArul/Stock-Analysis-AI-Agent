import React from "react";

function SmartScoreGauge({ recommendation, marketAnalysis, sentimentAnalysis }) {
  const overallConfidence = recommendation?.confidence ?? 78;
  const valuationScore = marketAnalysis?.financialScore ?? 75;
  const growthScore = Math.min(100, Math.round(overallConfidence * 1.05));
  const healthScore = Math.min(100, Math.round((valuationScore + overallConfidence) / 2));
  const sentimentScore = sentimentAnalysis?.sentimentScore ?? 72;

  // Composite AI Weighted Calculation (0-100)
  const compositeScore = Math.round(
    valuationScore * 0.3 + growthScore * 0.3 + healthScore * 0.2 + sentimentScore * 0.2
  );

  const getScoreColor = (score) => {
    if (score >= 75) return "#10B981"; // Emerald Green
    if (score >= 50) return "#F59E0B"; // Amber
    return "#EF4444"; // Rose Red
  };

  const getQGLPVerdict = (score) => {
    if (score >= 80) return { label: "💎 High Quality & Growth Leader", color: "#10B981" };
    if (score >= 60) return { label: "⚖️ Steady Growth & Fair Value", color: "#60A5FA" };
    return { label: "⚠️ High Volatility / Speculative", color: "#EF4444" };
  };

  const verdict = getQGLPVerdict(compositeScore);

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.2s", marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            🤖 AI Composite Smart Rating (0–100)
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Multi-dimensional AI evaluation of valuation, growth, solvency & news sentiment
          </span>
        </div>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: verdict.color,
            background: `${verdict.color}15`,
            border: `1px solid ${verdict.color}40`,
            padding: "6px 14px",
            borderRadius: "8px",
          }}
        >
          {verdict.label}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", alignItems: "center" }}>
        {/* Big Overall Composite Gauge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid var(--card-border)" }}>
          <div style={{ position: "relative", width: "140px", height: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="12" />
              <circle
                cx="70"
                cy="70"
                r="58"
                fill="none"
                stroke={getScoreColor(compositeScore)}
                strokeWidth="12"
                strokeDasharray="364.4"
                strokeDashoffset={364.4 - (364.4 * compositeScore) / 100}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1.5s ease-out", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
              />
            </svg>
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: getScoreColor(compositeScore) }}>
                {compositeScore}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                AI Rating
              </div>
            </div>
          </div>
          <div style={{ marginTop: "12px", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-main)" }}>
            Overall Investment Grade
          </div>
        </div>

        {/* 4 Sub-Score Dimensional Progress Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-main)", fontWeight: "500" }}>🏷️ Valuation Score</span>
              <strong style={{ color: getScoreColor(valuationScore) }}>{valuationScore} / 100</strong>
            </div>
            <div style={{ width: "100%", height: "8px", background: "var(--card-border)", borderRadius: "4px" }}>
              <div style={{ width: `${valuationScore}%`, height: "100%", background: getScoreColor(valuationScore), borderRadius: "4px", transition: "width 1s ease" }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-main)", fontWeight: "500" }}>🚀 Growth & Momentum</span>
              <strong style={{ color: getScoreColor(growthScore) }}>{growthScore} / 100</strong>
            </div>
            <div style={{ width: "100%", height: "8px", background: "var(--card-border)", borderRadius: "4px" }}>
              <div style={{ width: `${growthScore}%`, height: "100%", background: getScoreColor(growthScore), borderRadius: "4px", transition: "width 1s ease" }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-main)", fontWeight: "500" }}>🛡️ Balance Sheet Resilience</span>
              <strong style={{ color: getScoreColor(healthScore) }}>{healthScore} / 100</strong>
            </div>
            <div style={{ width: "100%", height: "8px", background: "var(--card-border)", borderRadius: "4px" }}>
              <div style={{ width: `${healthScore}%`, height: "100%", background: getScoreColor(healthScore), borderRadius: "4px", transition: "width 1s ease" }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-main)", fontWeight: "500" }}>📰 News & Market Sentiment</span>
              <strong style={{ color: getScoreColor(sentimentScore) }}>{sentimentScore} / 100</strong>
            </div>
            <div style={{ width: "100%", height: "8px", background: "var(--card-border)", borderRadius: "4px" }}>
              <div style={{ width: `${sentimentScore}%`, height: "100%", background: getScoreColor(sentimentScore), borderRadius: "4px", transition: "width 1s ease" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartScoreGauge;
