import React from "react";

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
      <div className="agent-insight-card">
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
          <div className="agent-score-container">
            <span className="agent-score-value" style={{ color: getScoreColor(marketAnalysis.financialScore) }}>
              {marketAnalysis.financialScore}
            </span>
            <span className="agent-score-label">/100 Health</span>
          </div>
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

      {/* Sentiment Analyst Insights */}
      <div className="agent-insight-card">
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
          <div className="agent-score-container">
            <span className="agent-score-value" style={{ color: getScoreColor(sentimentAnalysis.sentimentScore) }}>
              {sentimentAnalysis.sentimentScore}
            </span>
            <span className="agent-score-label">/100 Sentiment</span>
          </div>
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
    </div>
  );
}

export default SubAgentInsights;
