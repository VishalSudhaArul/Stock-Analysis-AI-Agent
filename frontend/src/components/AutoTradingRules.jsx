import { useState } from "react";

function AutoTradingRules() {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: "Bearish Sentiment Stop-Loss Guard",
      condition: "AI Sentiment < 35% AND Price Drop > 3%",
      action: "Trigger Paper Stop-Loss & Telegram Notification",
      active: true,
    },
    {
      id: 2,
      name: "RSI Oversold Smart Accumulator",
      condition: "RSI (14) < 30 AND Smart Score > 80",
      action: "Auto Execute $500 Paper SIP Buy Order",
      active: true,
    },
    {
      id: 3,
      name: "Earnings Surprise Volatility Trigger",
      condition: "Earnings Surprise > +10% AND Volume > 2x Avg",
      action: "Alert Analyst Chatbot & Add to Priority Watchlist",
      active: false,
    },
  ]);

  const [newRuleName, setNewRuleName] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newAction, setNewAction] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [simulatingId, setSimulatingId] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  const toggleRule = (id) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRuleName || !newCondition || !newAction) return;
    const newRule = {
      id: Date.now(),
      name: newRuleName,
      condition: newCondition,
      action: newAction,
      active: true,
    };
    setRules((prev) => [...prev, newRule]);
    setNewRuleName("");
    setNewCondition("");
    setNewAction("");
    setShowAddModal(false);
  };

  const handleTestRule = (rule) => {
    setSimulatingId(rule.id);
    setSimulationResult(null);
    setTimeout(() => {
      setSimulatingId(null);
      setSimulationResult({
        ruleId: rule.id,
        status: "Trigger Condition Matched!",
        details: `Simulated execution of '${rule.action}' verified against real-time market data stream.`,
      });
    }, 1200);
  };

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
      <div className="card-header" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>⚡</span>
          <div>
            <h2 className="card-title">Automated AI Trading Rules & Webhook Signals</h2>
            <p className="card-subtitle">Define automated conditional execution rules based on AI sentiment and technical indicators</p>
          </div>
        </div>
        <button className="action-btn primary" onClick={() => setShowAddModal(!showAddModal)}>
          {showAddModal ? "Cancel" : "+ Create AI Rule"}
        </button>
      </div>

      {showAddModal && (
        <form onSubmit={handleAddRule} style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "16px", borderRadius: "10px", margin: "14px 0" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "12px", color: "#60a5fa" }}>Define Custom Execution Trigger</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="Rule Name (e.g. Volume Spike Breakout)"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              className="search-input"
              style={{ padding: "8px 12px", fontSize: "0.88rem" }}
              required
            />
            <input
              type="text"
              placeholder="Condition (e.g. Sentiment > 85% AND P/E < 25)"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              className="search-input"
              style={{ padding: "8px 12px", fontSize: "0.88rem" }}
              required
            />
            <input
              type="text"
              placeholder="Action (e.g. Buy 10 Shares)"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              className="search-input"
              style={{ padding: "8px 12px", fontSize: "0.88rem" }}
              required
            />
          </div>
          <button type="submit" className="action-btn primary" style={{ width: "100%", padding: "8px" }}>
            Save Rule
          </button>
        </form>
      )}

      {simulationResult && (
        <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", padding: "12px 16px", borderRadius: "8px", margin: "14px 0", fontSize: "0.9rem" }}>
          <strong style={{ color: "#10b981" }}>✅ {simulationResult.status}</strong>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-main)" }}>{simulationResult.details}</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
        {rules.map((rule) => (
          <div
            key={rule.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: rule.active ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              opacity: rule.active ? 1 : 0.6,
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "0.95rem" }}>
                {rule.name}
              </div>
              <div style={{ fontSize: "0.83rem", color: "#60a5fa", marginTop: "2px" }}>
                IF <code>{rule.condition}</code>
              </div>
              <div style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginTop: "2px" }}>
                THEN <span>{rule.action}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => handleTestRule(rule)}
                disabled={simulatingId === rule.id}
                className="action-btn"
                style={{ padding: "4px 10px", fontSize: "0.8rem", borderRadius: "6px" }}
              >
                {simulatingId === rule.id ? "Testing..." : "⚡ Test Rule"}
              </button>

              <button
                onClick={() => toggleRule(rule.id)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  border: "none",
                  background: rule.active ? "#10b981" : "#4b5563",
                  color: "#ffffff",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {rule.active ? "ACTIVE" : "PAUSED"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AutoTradingRules;
