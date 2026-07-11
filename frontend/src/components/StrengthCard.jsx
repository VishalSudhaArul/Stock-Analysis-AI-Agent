function StrengthCard({ strengths }) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className="card col-third animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <div className="card-header">
        <h2 className="card-title">💪 Strengths</h2>
      </div>

      <ul className="custom-list list-positive">
        {strengths.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default StrengthCard;