import React from "react";

function ExportReportModal({ isOpen, onClose, result }) {
  if (!isOpen || !result) return null;

  const symbol = result.marketData?.symbol || "STOCK";

  const handleExportCSV = () => {
    const data = [
      ["Metric", "Value"],
      ["Symbol", symbol],
      ["Company Name", result.marketData?.companyName || symbol],
      ["Current Price", `${result.marketData?.currency === "INR" ? "₹" : "$"}${result.marketData?.price}`],
      ["Recommendation", result.analysis?.recommendation || "N/A"],
      ["Confidence Score", `${result.analysis?.confidence || 0}%`],
      ["P/E Ratio", result.marketData?.peRatio || "N/A"],
      ["Summary Reasoning", `"${(result.analysis?.reasoning || "").replace(/"/g, '""')}"`],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + data.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${symbol}_AI_Investment_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content animate-fade-in-up" style={{ maxWidth: "480px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
            📑 Export AI Research Executive Summary
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "20px", lineHeight: "1.5" }}>
          Export institutional AI analysis report for <strong>{symbol}</strong> formatted for client pitchbooks or investment records.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={handleExportCSV}
            className="search-btn"
            style={{ width: "100%", justifyContent: "center", background: "rgba(16, 185, 129, 0.2)", borderColor: "rgba(16, 185, 129, 0.4)", color: "#34D399" }}
          >
            📊 Download CSV Spreadsheet (.csv)
          </button>

          <button
            onClick={handlePrintPDF}
            className="search-btn"
            style={{ width: "100%", justifyContent: "center", background: "rgba(59, 130, 246, 0.2)", borderColor: "rgba(59, 130, 246, 0.4)", color: "#60A5FA" }}
          >
            🖨️ Print / Save as PDF Document (.pdf)
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportReportModal;
