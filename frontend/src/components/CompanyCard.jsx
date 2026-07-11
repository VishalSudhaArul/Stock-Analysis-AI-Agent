function CompanyCard({ data }) {
  if (!data) return null;

  return (
    <div className="card col-half animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="card-header">
        <h2 className="card-title">🏢 Company Profile</h2>
      </div>
      
      <div style={{ marginBottom: "15px" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "5px", color: "var(--accent-primary)" }}>
          {data.company}
        </h3>
        <span className="tag">{data.industry}</span>
      </div>
      
      <p style={{ lineHeight: "1.6", color: "var(--text-main)" }}>
        {data.overview}
      </p>
    </div>
  );
}

export default CompanyCard;