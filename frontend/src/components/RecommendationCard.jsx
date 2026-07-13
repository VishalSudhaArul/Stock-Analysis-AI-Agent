function RecommendationCard({ recommendation, confidence, isWatched, onToggleWatchlist }) {
  const recLower = recommendation.toLowerCase();
  let colorClass = "rec-buy";
  let barColor = "#10B981"; // emerald
  let gradientColor = "rgba(16, 185, 129, 0.15)";
  
  if (recLower.includes("hold")) {
    colorClass = "rec-hold";
    barColor = "#F59E0B"; // amber
    gradientColor = "rgba(245, 158, 11, 0.15)";
  } else if (recLower.includes("sell")) {
    colorClass = "rec-sell";
    barColor = "#EF4444"; // rose
    gradientColor = "rgba(239, 68, 68, 0.15)";
  }

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="recommendation-banner" style={{ background: `linear-gradient(135deg, ${gradientColor} 0%, rgba(0,0,0,0.3) 100%)` }}>
        <div className="rec-title">AI Investment Recommendation</div>
        <div className={`rec-value ${colorClass}`}>{recommendation}</div>
        
        <div className="confidence-container" style={{ maxWidth: '400px', margin: '20px auto 0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: '8px' }}>
            <span>Analyst Confidence</span>
            <span style={{ color: "var(--text-heading)", fontWeight: "600" }}>{confidence}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
            <div style={{
              height: '100%',
              width: `${confidence}%`,
              backgroundColor: barColor,
              borderRadius: '4px',
              boxShadow: `0 0 12px ${barColor}`,
              transition: 'width 1s ease-out'
            }} />
          </div>
        </div>

        {onToggleWatchlist && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              className={`add-watchlist-btn ${isWatched ? 'active' : ''}`}
              onClick={onToggleWatchlist}
            >
              {isWatched ? '★ Saved to Watchlist' : '☆ Add to Watchlist'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecommendationCard;