function RecommendationCard({ recommendation, confidence }) {
  // Determine color class based on recommendation
  const recLower = recommendation.toLowerCase();
  let colorClass = "rec-hold";
  if (recLower.includes("buy")) colorClass = "rec-buy";
  if (recLower.includes("sell")) colorClass = "rec-sell";

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="recommendation-banner">
        <div className="rec-title">AI Investment Recommendation</div>
        <div className={`rec-value ${colorClass}`}>{recommendation}</div>
        <div style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Confidence Score: <span style={{ color: "var(--text-heading)", fontWeight: "600" }}>{confidence}%</span>
        </div>
      </div>
    </div>
  );
}

export default RecommendationCard;