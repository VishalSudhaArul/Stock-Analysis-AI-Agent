import { useState } from "react";
import { saveReportApi } from "../services/api";

function ShareReportModal({ isOpen, onClose, currentResult }) {
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !currentResult) return null;

  const handleGenerateShareLink = async () => {
    setLoading(true);
    setError("");
    try {
      const symbol = currentResult.marketData?.symbol || "STOCK";
      const companyName = currentResult.analysis?.company || "Company";
      const analysisData = JSON.stringify(currentResult);

      const res = await saveReportApi(symbol, companyName, analysisData);
      if (res.success && res.shareUrl) {
        setShareUrl(res.shareUrl);
      } else {
        setError("Failed to generate share link.");
      }
    } catch {
      setError("Server error generating share link.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const company = currentResult.analysis?.company || "Stock Analysis";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🔗 Share AI Research Report</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-subtitle">
          Publish a viral, live-updated AI research page for <strong>{company}</strong>.
        </div>

        {error && <div className="auth-error-badge">{error}</div>}

        {!shareUrl ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Generate a unique public link that anyone can view with live real-time market data.
            </p>
            <button
              className="auth-submit-btn"
              onClick={handleGenerateShareLink}
              disabled={loading}
            >
              {loading ? "Generating Unique URL..." : "✨ Create Shareable Link"}
            </button>
          </div>
        ) : (
          <div className="share-url-container">
            <label className="form-label">Public Research URL</label>
            <div className="share-input-group">
              <input type="text" className="form-input" value={shareUrl} readOnly />
              <button className="share-copy-btn" onClick={handleCopy}>
                {copied ? "Copied! ✓" : "Copy Link"}
              </button>
            </div>

            <div className="social-share-buttons">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Check out this AI Deep Dive Report on ${company}:`
                )}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="social-btn twitter"
              >
                🐦 Share on X / Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noreferrer"
                className="social-btn linkedin"
              >
                💼 Share on LinkedIn
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareReportModal;
