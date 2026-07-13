import { useState, useEffect } from "react";
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
import SubAgentInsights from "../components/SubAgentInsights";
import CompareMatrix from "../components/CompareMatrix";
import Watchlist from "../components/Watchlist";

function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem("watchlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Apply Theme Mode class to body
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Persist Watchlist
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

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

  const handleToggleWatchlist = () => {
    if (!result) return;
    const symbol = result.marketData.symbol;
    const isAlreadyWatched = watchlist.some((item) => item.symbol === symbol);

    if (isAlreadyWatched) {
      setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
    } else {
      const newItem = {
        symbol: result.marketData.symbol,
        companyName: result.analysis.company,
        recommendation: result.analysis.recommendation,
        confidence: result.analysis.confidence,
        price: result.marketData.currentPrice,
        currency: result.marketData.currency,
        addedAt: new Date().toISOString(),
        fullData: result, // Cache full payload for comparison matrix
      };
      setWatchlist((prev) => [...prev, newItem]);
    }
  };

  const handleRemoveFromWatchlist = (symbol) => {
    setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
  };

  const handleCompareSelect = async (companyName) => {
    try {
      setLoading(true);
      const response = await analyzeCompany(companyName);
      if (response.success) {
        // Update comparison cache in watchlist
        setWatchlist((prev) =>
          prev.map((item) =>
            item.symbol === response.data.marketData.symbol
              ? { ...item, price: response.data.marketData.currentPrice, fullData: response.data }
              : item
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze stock for comparison.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="container">
      {/* Floating Toolbar */}
      <div className="floating-actions">
        <button className="action-btn" onClick={toggleTheme} title="Toggle Color Theme">
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        {result && (
          <button className="action-btn" onClick={handleExportPDF} title="Download Report as PDF">
            📄 Export PDF Report
          </button>
        )}
      </div>

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
            isWatched={watchlist.some((item) => item.symbol === result.marketData?.symbol)}
            onToggleWatchlist={handleToggleWatchlist}
          />

          {/* Sub-Agent Insights (Market Analyst + Sentiment Analyst) */}
          <SubAgentInsights
            marketAnalysis={result.marketAnalysis}
            sentimentAnalysis={result.sentimentAnalysis}
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

          {/* Stock Comparison Matrix */}
          <CompareMatrix
            currentResult={result}
            watchlist={watchlist}
            onCompareSelect={handleCompareSelect}
          />

          <NewsCard news={result.latestNews} />
        </div>
      )}

      {/* Watchlist Section */}
      <Watchlist
        watchlist={watchlist}
        onAnalyze={handleSearch}
        onRemove={handleRemoveFromWatchlist}
      />
    </div>
  );
}

export default Home;