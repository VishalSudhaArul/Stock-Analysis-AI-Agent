import { useState, useEffect } from "react";
import { getInsiderAuditApi } from "../services/api";

function SecInsiderAudit({ symbol }) {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAudit() {
      if (!symbol) return;
      setLoading(true);
      try {
        const res = await getInsiderAuditApi(symbol);
        if (res.success) {
          setAuditData(res.data);
        }
      } catch (err) {
        console.warn("SEC Insider audit fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, [symbol]);

  if (!symbol) return null;

  if (loading) {
    return (
      <div className="card col-full text-center p-3">
        <span className="spinner"></span> Parsing SEC Form 4 Filings & 10-K Audit Logs for {symbol}...
      </div>
    );
  }

  if (!auditData) return null;

  return (
    <div className="card col-full animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
      <div className="card-header" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>🕵️‍♂️</span>
          <div>
            <h2 className="card-title">SEC 10-K & C-Suite Insider Audit Tracker</h2>
            <p className="card-subtitle">Form 4 Insider Trading Activity & Institutional Holding Structure for {symbol}</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#10b981" }}>{auditData.auditScore}/100</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Audit Health Score</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", margin: "14px 0" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>SEC Filing Status</div>
          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#60a5fa", marginTop: "4px" }}>{auditData.secFilingStatus}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Institutional Ownership</div>
          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#a855f7", marginTop: "4px" }}>{auditData.institutionalOwnership}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Executive Sentiment</div>
          <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#10b981", marginTop: "4px" }}>{auditData.insiderSentiment}</div>
        </div>
      </div>

      <h3 style={{ fontSize: "0.95rem", margin: "14px 0 8px 0", color: "var(--text-muted)" }}>Recent C-Suite Form 4 Insider Transactions</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left", color: "var(--text-muted)" }}>
              <th style={{ padding: "6px" }}>Executive Role</th>
              <th style={{ padding: "6px" }}>Action</th>
              <th style={{ padding: "6px" }}>Shares</th>
              <th style={{ padding: "6px" }}>Est. Value</th>
              <th style={{ padding: "6px" }}>Timeline</th>
            </tr>
          </thead>
          <tbody>
            {auditData.recentTransactions?.map((tx, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "8px 6px", fontWeight: "600" }}>{tx.executive}</td>
                <td style={{ padding: "8px 6px" }}>
                  <span className={`badge ${tx.action.includes("BUY") ? "badge-success" : "badge-warning"}`}>
                    {tx.action}
                  </span>
                </td>
                <td style={{ padding: "8px 6px", color: tx.shares.startsWith("+") ? "#10b981" : "var(--text-main)" }}>{tx.shares}</td>
                <td style={{ padding: "8px 6px", fontWeight: "600" }}>{tx.value}</td>
                <td style={{ padding: "8px 6px", color: "var(--text-muted)" }}>{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "14px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", color: "var(--text-muted)" }}>Audit Checklist & Footnotes:</div>
        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.85rem", color: "var(--text-main)", lineHeight: "1.6" }}>
          {auditData.riskAuditNotes?.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SecInsiderAudit;
