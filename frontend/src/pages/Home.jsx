import { useState } from "react";
import SearchBar from "../components/SearchBar";
import CompanyCard from "../components/CompanyCard";
import RecommendationCard from "../components/RecommendationCard";
import StrengthCard from "../components/StrengthCard";
import RiskCard from "../components/RiskCard";
import OpportunityCard from "../components/OpportunityCard";
import LoadingSpinner from "../components/LoadingSpinner";
import StockCard from "../components/StockCard";
import StockChart from "../components/StockChart";
import { analyzeCompany } from "../services/api";
import NewsCard from "../components/NewsCard";

function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (company) => {
    try {
      setLoading(true);

      const response = await analyzeCompany(company);

      if (response.success) {
        setResult(response.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze company.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">AI Investment Agent</h1>

      <SearchBar
        onSearch={handleSearch}
        loading={loading}
      />

      <div className="quick-search-tags">
        <span>Try:</span>
        {["Apple", "Tesla", "Nvidia", "Infosys", "Microsoft"].map((item) => (
          <button
            key={item}
            onClick={() => handleSearch(item)}
            disabled={loading}
            className="quick-search-tag"
          >
            {item}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}

      {result && (
        <div className="dashboard-grid">
          <RecommendationCard
            recommendation={result.analysis.recommendation}
            confidence={result.analysis.confidence}
          />

          <CompanyCard data={result.analysis} />

          <StockCard stock={result.marketData} />

          {result.marketData && result.marketData.historical && (
            <StockChart
              historicalData={result.marketData.historical}
              currency={result.marketData.currency}
            />
          )}

          <StrengthCard
            strengths={result.analysis.strengths}
          />

          <OpportunityCard
            opportunities={result.analysis.opportunities}
          />

          <RiskCard
            risks={result.analysis.risks}
          />

          {result.analysis.weaknesses && result.analysis.weaknesses.length > 0 && (
            <div className="card col-third animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <div className="card-header">
                <h2 className="card-title">📉 Weaknesses</h2>
              </div>
              <ul className="custom-list list-negative">
                {result.analysis.weaknesses.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="card col-full animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="card-header">
              <h2 className="card-title">🧠 AI Reasoning</h2>
            </div>
            <p style={{ lineHeight: "1.8", color: "var(--text-main)", fontSize: "1.05rem" }}>
              {result.analysis.reasoning}
            </p>
          </div>

          <NewsCard news={result.latestNews} />
        </div>
      )}
    </div>
  );
}

export default Home;