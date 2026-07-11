function LoadingSpinner() {
  return (
    <div className="spinner-container animate-fade-in-up">
      <div className="spinner"></div>
      <p style={{ color: "var(--accent-primary)", fontSize: "1.1rem", fontWeight: "500", letterSpacing: "1px" }}>
        AI IS ANALYZING...
      </p>
    </div>
  );
}

export default LoadingSpinner;