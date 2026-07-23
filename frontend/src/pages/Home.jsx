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
import NewsCard from "../components/NewsCard";
import SubAgentInsights from "../components/SubAgentInsights";
import CompareMatrix from "../components/CompareMatrix";
import Watchlist from "../components/Watchlist";
import AnalystChat from "../components/AnalystChat";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import TradingModal from "../components/TradingModal";
import ShareReportModal from "../components/ShareReportModal";
import PortfolioDashboard from "../components/PortfolioDashboard";
import { analyzeCompany } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Home() {
  const [activeTab, setActiveTab] = useState("research"); // 'research' or 'portfolio'
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Modal controls
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "login" });
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();

  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem("watchlist");
      const parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => item && typeof item === "object")
          .map((item) => {
            let sym = "N/A";
            let compName = "N/A";
            if (item.symbol && typeof item.symbol === "object") {
              sym = item.symbol.symbol || "N/A";
              compName = item.symbol.name || "N/A";
            } else if (typeof item.symbol === "string") {
              sym = item.symbol;
              compName = item.companyName || item.name || "N/A";
            }
            return {
              symbol: sym,
              companyName: compName,
              recommendation: item.recommendation || "HOLD",
              confidence: item.confidence || 50,
              price: item.price || 0,
              currency: item.currency || "USD",
              addedAt: item.addedAt || new Date().toISOString(),
              fullData: item.fullData || null,
            };
          });
      }
      return [];
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
      setActiveTab("research");
      const response = await analyzeCompany(company);
      if (response.success) {
        setResult(response.data);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || "Failed to analyze company.";
      alert(`Analysis Error: ${errMsg}`);
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
        fullData: result,
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

  const openAuthModal = (mode = "login") => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleOpenTrade = () => {
    if (!isAuthenticated) {
      openAuthModal("signup");
    } else {
      setIsTradeModalOpen(true);
    }
  };

  return (
    <>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={openAuthModal}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="container">
        {/* Floating Toolbar */}
        <div className="floating-actions">
          {result && activeTab === "research" && (
            <button className="action-btn" onClick={handleExportPDF} title="Download Report as PDF">
              📄 Export PDF Report
            </button>
          )}
        </div>

        {activeTab === "portfolio" ? (
          <PortfolioDashboard onSearchStock={handleSearch} />
        ) : (
          <>
            <h1 className="page-title">AI Investment Agent</h1>

            <SearchBar onSearch={handleSearch} loading={loading} />

            <div className="quick-search-tags">
              <span>Popular:</span>
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
                  onOpenTrade={handleOpenTrade}
                  onOpenShare={() => setIsShareModalOpen(true)}
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

                <StrengthCard strengths={result.analysis.strengths} />

                <OpportunityCard opportunities={result.analysis.opportunities} />

                <RiskCard risks={result.analysis.risks} />

                {result.analysis.weaknesses && result.analysis.weaknesses.length > 0 && (
                  <div className="card col-third animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
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

                <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
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
          </>
        )}

        {/* Floating Analyst Chat */}
        <AnalystChat currentResult={result} />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
      />

      {/* Trade Modal */}
      {result && (
        <TradingModal
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          symbol={result.marketData?.symbol}
          companyName={result.analysis?.company}
          currentPrice={result.marketData?.currentPrice}
          onTradeComplete={() => setActiveTab("portfolio")}
        />
      )}

      {/* Share Report Modal */}
      {result && (
        <ShareReportModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          currentResult={result}
        />
      )}
    </>
  );
}

export default Home;