import { useState } from "react";
import { executeTradeApi } from "../services/api";

function TradingModal({ isOpen, onClose, symbol, companyName, currentPrice, userBalance, onTradeComplete }) {
  const [tradeType, setTradeType] = useState("BUY"); // 'BUY' or 'SELL'
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const totalCost = (parseFloat(shares || 0) * (currentPrice || 0)).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await executeTradeApi(symbol, tradeType, parseFloat(shares));
      if (res && res.success) {
        setSuccessMsg(res.message || `Successfully executed ${tradeType} order!`);
        if (onTradeComplete) {
          onTradeComplete(res.data);
        }
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 1200);
      } else {
        setError(res?.error || res?.message || "Trade execution failed.");
      }
    } catch (err) {
      console.error("Trade error:", err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to execute paper trade."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📈 Paper Trade: {symbol}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-subtitle">{companyName || symbol}</div>

        <div className="trade-type-selector">
          <button
            type="button"
            className={`trade-type-btn buy ${tradeType === "BUY" ? "active" : ""}`}
            onClick={() => setTradeType("BUY")}
          >
            BUY
          </button>
          <button
            type="button"
            className={`trade-type-btn sell ${tradeType === "SELL" ? "active" : ""}`}
            onClick={() => setTradeType("SELL")}
          >
            SELL
          </button>
        </div>

        {error && <div className="auth-error-badge">{error}</div>}
        {successMsg && <div className="trade-success-badge">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="trade-info-card">
            <div className="trade-info-row">
              <span className="trade-info-label">Current Market Price</span>
              <span className="trade-info-value">${currentPrice?.toFixed(2)}</span>
            </div>
            {tradeType === "BUY" && (
              <div className="trade-info-row">
                <span className="trade-info-label">Available Cash</span>
                <span className="trade-info-value">${userBalance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Number of Shares</label>
            <input
              type="number"
              step="any"
              min="0.0001"
              className="form-input"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              required
            />
          </div>

          <div className="trade-summary-card">
            <div className="trade-summary-row">
              <span>Estimated Order Total</span>
              <span className="trade-summary-price">${totalCost}</span>
            </div>
          </div>

          <button
            type="submit"
            className={`auth-submit-btn ${tradeType === "SELL" ? "sell-btn" : ""}`}
            disabled={loading || !shares || shares <= 0}
          >
            {loading ? "Executing Trade..." : `${tradeType} ${shares || 0} SHARES OF ${symbol}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TradingModal;
