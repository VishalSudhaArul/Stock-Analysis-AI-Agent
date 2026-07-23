import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicReportApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import RecommendationCard from "../components/RecommendationCard";
import CompanyCard from "../components/CompanyCard";
import StockCard from "../components/StockCard";
import StockChart from "../components/StockChart";
import SubAgentInsights from "../components/SubAgentInsights";
import StrengthCard from "../components/StrengthCard";
import RiskCard from "../components/RiskCard";
import OpportunityCard from "../components/OpportunityCard";

function SharedReport() {
  const { shareId } = useParams();
  const [report, setReport] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPublicReport() {
      try {
        setLoading(true);
        setError("");
        const res = await getPublicReportApi(shareId);
        if (res.success) {
          const parsedAnalysis =
            typeof res.report.analysisData === "string"
              ? JSON.parse(res.report.analysisData)
              : res.report.analysisData;
          setReport(parsedAnalysis);
          setLiveData(res.liveMarketData);
        } else {
          setError(res.error || "Report not found.");
        }
      } catch (err) {
        setError(err.response?.data?.error || "Error loading shared report.");
      } finally {
        setLoading(false);
      }
    }
    loadPublicReport();
  }, [shareId]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container text-center" style={{ paddingTop: "80px" }}>
        <h2 style={{ color: "var(--negative)", marginBottom: "15px" }}>⚠️ Report Unavailable</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "25px" }}>{error}</p>
        <Link to="/" className="search-btn" style={{ textDecoration: "none", display: "inline-flex" }}>
          🏠 Go to AI Investment Desk
        </Link>
      </div>
    );
  }

  const analysis = report?.analysis || {};
  const marketData = liveData || report?.marketData || {};

  return (
    <div className="container">
      {/* Viral Header Banner */}
      <div className="shared-report-banner animate-fade-in-up">
        <div className="banner-info">
          <span className="banner-badge">🌐 Public AI Deep Dive</span>
          <h2>AI Research Report: {report?.companyName || marketData.symbol}</h2>
          <p>Created with AI Investment Agent. Live prices are updated in real-time.</p>
        </div>
        <Link to="/" className="search-btn" style={{ textDecoration: "none" }}>
          🚀 Create Your Own Report
        </Link>
      </div>

      <div className="dashboard-grid">
        <RecommendationCard
          recommendation={analysis.recommendation}
          confidence={analysis.confidence}
        />

        {report?.marketAnalysis && report?.sentimentAnalysis && (
          <SubAgentInsights
            marketAnalysis={report.marketAnalysis}
            sentimentAnalysis={report.sentimentAnalysis}
          />
        )}

        <CompanyCard data={analysis} />

        <StockCard stock={marketData} />

        {marketData && marketData.historical && (
          <StockChart
            historicalData={marketData.historical}
            currency={marketData.currency}
          />
        )}

        <StrengthCard strengths={analysis.strengths} />
        <OpportunityCard opportunities={analysis.opportunities} />
        <RiskCard risks={analysis.risks} />

        <div className="card col-full animate-fade-in-up">
          <div className="card-header">
            <h2 className="card-title">🧠 AI Reasoning</h2>
          </div>
          <p style={{ lineHeight: "1.8", color: "var(--text-main)", fontSize: "1.05rem" }}>
            {analysis.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SharedReport;
