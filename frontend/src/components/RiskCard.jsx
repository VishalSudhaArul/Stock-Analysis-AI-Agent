function RiskCard({ risks }) {
  if (!risks || risks.length === 0) return null;

  return (
    <div className="card col-third animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
      <div className="card-header">
        <h2 className="card-title">⚠️ Risks</h2>
      </div>

      <ul className="custom-list list-negative">
        {risks.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default RiskCard;