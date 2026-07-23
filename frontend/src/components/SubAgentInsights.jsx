import React from "react";

// Speedometer Gauge Component
const SpeedometerGauge = ({ value, label, color = "#3B82F6" }) => {
  const percentage = Math.min(100, Math.max(0, value)) / 100;
  // Arc angle spans from -90deg (0%) to 90deg (100%)
  const angle = -90 + percentage * 180;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '130px', flexShrink: 0 }}>
      <svg width="120" height="70" viewBox="0 0 120 70">
        {/* Background Arc */}
        <path
          d="M 15 60 A 45 45 0 0 1 105 60"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Active Arc */}
        <path
          d="M 15 60 A 45 45 0 0 1 105 60"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="141" /* pi * r = 3.14159 * 45 = 141.3 */
          strokeDashoffset={141 - (percentage * 141)}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
        {/* Center Needle */}
        <g transform="translate(60, 60)">
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-38"
            stroke="var(--text-heading)"
            strokeWidth="3.5"
            strokeLinecap="round"
            transform={`rotate(${angle})`}
            style={{ 
              transition: 'transform 1.2s cubic-bezier(0.1, 0.8, 0.2, 1)', 
              transformOrigin: '0px 0px' 
            }}
          />
          <circle cx="0" cy="0" r="6" fill="var(--text-heading)" />
          <circle cx="0" cy="0" r="3" fill={color} />
        </g>
      </svg>
      <span style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '6px', color: 'var(--text-heading)' }}>{value}%</span>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
    </div>
  );
};

function SubAgentInsights({ marketAnalysis, sentimentAnalysis }) {
  if (!marketAnalysis || !sentimentAnalysis) return null;

  const getScoreColor = (score) => {
    if (score >= 70) return "var(--positive)";
    if (score >= 45) return "#F59E0B"; // Amber
    return "var(--negative)";
  };

  const getStanceColor = (stance) => {
    const s = stance.toUpperCase();
    if (s === "UNDERVALUED" || s === "BULLISH") return "var(--positive)";
    if (s === "FAIRLY_VALUED" || s === "NEUTRAL") return "#F59E0B";
    return "var(--negative)";
  };

  return (
    <div className="sub-agents-container animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
      {/* Market Analyst Insights */}
      <div className="agent-insight-card" style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="agent-badge-row">
            <span className="agent-badge market">🤖 Market Analyst Agent</span>
            <span 
              className="watchlist-badge" 
              style={{ 
                backgroundColor: `${getStanceColor(marketAnalysis.valuationStance)}15`, 
                color: getStanceColor(marketAnalysis.valuationStance),
                border: `1px solid ${getStanceColor(marketAnalysis.valuationStance)}30`
              }}
            >
              {marketAnalysis.valuationStance}
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)', marginBottom: '16px' }}>
            {marketAnalysis.summary}
          </p>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Metrics Analyzed
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {marketAnalysis.keyMetricsEvaluated.map((metric, idx) => (
                <span 
                  key={idx} 
                  className="tag" 
                  style={{ 
                    margin: 0, 
                    fontSize: '0.8rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid var(--card-border)', 
                    color: 'var(--text-main)' 
                  }}
                >
                  {metric}
                </span>
              ))}
            </div>
          </div>
        </div>

        <SpeedometerGauge 
          value={marketAnalysis.financialScore} 
          label="Health Score" 
          color={getScoreColor(marketAnalysis.financialScore)} 
        />
      </div>

      {/* Sentiment Analyst Insights */}
      <div className="agent-insight-card" style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="agent-badge-row">
            <span className="agent-badge sentiment">🤖 Sentiment Analyst Agent</span>
            <span 
              className="watchlist-badge" 
              style={{ 
                backgroundColor: `${getStanceColor(sentimentAnalysis.sentimentStance)}15`, 
                color: getStanceColor(sentimentAnalysis.sentimentStance),
                border: `1px solid ${getStanceColor(sentimentAnalysis.sentimentStance)}30`
              }}
            >
              {sentimentAnalysis.sentimentStance}
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)', marginBottom: '16px' }}>
            {sentimentAnalysis.summary}
          </p>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Key News Themes
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {sentimentAnalysis.keyNewsThemes.map((theme, idx) => (
                <span 
                  key={idx} 
                  className="tag" 
                  style={{ 
                    margin: 0, 
                    fontSize: '0.8rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid var(--card-border)', 
                    color: 'var(--text-main)' 
                  }}
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>

        <SpeedometerGauge 
          value={sentimentAnalysis.sentimentScore} 
          label="News Stance" 
          color={getScoreColor(sentimentAnalysis.sentimentScore)} 
        />
      </div>
    </div>
  );
}

export default SubAgentInsights;
