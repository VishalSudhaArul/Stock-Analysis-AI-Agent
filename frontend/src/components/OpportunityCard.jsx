function OpportunityCard({ opportunities }) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <div className="card col-third animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
      <div className="card-header">
        <h2 className="card-title">🚀 Opportunities</h2>
      </div>

      <ul className="custom-list list-positive">
        {opportunities.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default OpportunityCard;