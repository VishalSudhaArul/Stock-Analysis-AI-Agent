import { useState, useEffect } from "react";
import { executeTradeApi, getPortfolioApi } from "../services/api";

function TradingModal({ 
  isOpen, 
  onClose, 
  symbol, 
  companyName, 
  currentPrice, 
  currency = "USD", 
  userBalance: initialBalance, 
  initialTradeType = "BUY",
  initialShares = 1,
  maxOwnedShares = 0,
  onTradeComplete 
}) {
  const [tradeType, setTradeType] = useState(initialTradeType); // 'BUY' or 'SELL'
  const [shares, setShares] = useState(initialShares);
  const [targetPrice, setTargetPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [cashBalance, setCashBalance] = useState(initialBalance);

  useEffect(() => {
    if (isOpen) {
      setTradeType(initialTradeType);
      setShares(initialShares || 1);

      // Load existing alerts from localStorage if available
      try {
        const storedAlerts = JSON.parse(localStorage.getItem("stock_price_alerts") || "{}");
        if (storedAlerts[symbol]) {
          setTargetPrice(storedAlerts[symbol].targetPrice || "");
          setStopLoss(storedAlerts[symbol].stopLoss || "");
        }
      } catch (err) {
        console.warn("Could not read price alerts from local storage:", err.message);
      }

      if (cashBalance === undefined || cashBalance === null) {
        getPortfolioApi()
          .then((res) => {
            if (res && res.success && res.data) {
              setCashBalance(res.data.cashBalance);
            }
          })
          .catch((err) => console.warn("Could not fetch user portfolio balance for trading modal:", err.message));
      }
    }
  }, [isOpen, initialTradeType, initialShares, symbol]);

  if (!isOpen) return null;

  const symbolMap = { USD: "$", INR: "₹", EUR: "€", GBP: "£" };
  const currencySymbol = symbolMap[currency] || (currency === "INR" ? "₹" : "$");

  const totalCost = (parseFloat(shares || 0) * (currentPrice || 0)).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await executeTradeApi(symbol, tradeType, parseFloat(shares));
      if (res && res.success) {
        // Save target price and stop loss alerts if provided
        try {
          const storedAlerts = JSON.parse(localStorage.getItem("stock_price_alerts") || "{}");
          if (targetPrice || stopLoss) {
            storedAlerts[symbol] = {
              targetPrice: targetPrice ? parseFloat(targetPrice) : null,
              stopLoss: stopLoss ? parseFloat(stopLoss) : null,
              updatedAt: new Date().toISOString(),
            };
          } else {
            delete storedAlerts[symbol];
          }
          localStorage.setItem("stock_price_alerts", JSON.stringify(storedAlerts));
        } catch (alertErr) {
          console.warn("Failed to persist alerts:", alertErr.message);
        }

        setSuccessMsg(res.message || `Successfully executed ${tradeType} order!`);
        if (res.data?.newBalance !== undefined) {
          setCashBalance(res.data.newBalance);
        }
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
          <h2 className="modal-title">
            {tradeType === "BUY" ? "📈 Paper Buy" : "🔴 Paper Sell"}: {symbol}
          </h2>
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
              <span className="trade-info-value">{currencySymbol}{currentPrice?.toFixed(2)}</span>
            </div>
            {tradeType === "BUY" ? (
              <div className="trade-info-row">
                <span className="trade-info-label">Available Buying Power</span>
                <span className="trade-info-value">
                  ${(cashBalance ?? 100000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ) : (
              <div className="trade-info-row">
                <span className="trade-info-label">Shares Owned</span>
                <span className="trade-info-value" style={{ color: "#60a5fa" }}>
                  {maxOwnedShares} Shares
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Number of Shares</label>
              {tradeType === "SELL" && maxOwnedShares > 0 && (
                <button
                  type="button"
                  onClick={() => setShares(maxOwnedShares)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Sell All ({maxOwnedShares})
                </button>
              )}
            </div>
            <input
              type="number"
              step="any"
              min="0.0001"
              max={tradeType === "SELL" && maxOwnedShares > 0 ? maxOwnedShares : undefined}
              className="form-input"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              required
            />
          </div>

          {/* AI Price Target & Stop Loss Alerts (Feature #4) */}
          <div style={{ borderTop: "1px dashed var(--card-border)", paddingTop: "12px", marginTop: "12px" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent-primary)", marginBottom: "8px", display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎯 Technical Price Target & Stop-Loss Alerts
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: 'block', marginBottom: '4px' }}>Target Profit Price ({currencySymbol})</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 350.00"
                  className="form-input"
                  style={{ fontSize: "0.85rem", padding: "6px 10px" }}
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: 'block', marginBottom: '4px' }}>Stop-Loss Price ({currencySymbol})</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 310.00"
                  className="form-input"
                  style={{ fontSize: "0.85rem", padding: "6px 10px" }}
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="trade-summary-card" style={{ marginTop: "16px" }}>
            <div className="trade-summary-row">
              <span>Estimated Order Total</span>
              <span className="trade-summary-price">{currencySymbol}{totalCost}</span>
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
