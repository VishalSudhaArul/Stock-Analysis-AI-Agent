const NewsCard = ({ news }) => {
  if (!news || news.length === 0) return null;

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
      <div className="card-header">
        <h2 className="card-title">📰 Latest News & Analysis</h2>
      </div>

      <div className="news-grid">
        {news.map((item, index) => (
          <div className="news-item" key={index}>
            <div className="news-meta">
              <span className="tag">{item.source}</span>
              <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
            </div>

            <h3 className="news-title">{item.title}</h3>

            <p className="news-desc">{item.description}</p>

            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="news-link"
            >
              Read Full Article →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsCard;