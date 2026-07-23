import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;
      if (mode === "signup") {
        res = await signup(email, password);
      } else {
        res = await login(email, password);
      }

      if (res.success) {
        onClose();
        setEmail("");
        setPassword("");
      } else {
        setError(res.error || "Authentication failed.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === "signup" ? "🚀 Create Account" : "🔑 Welcome Back"}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-subtitle">
          {mode === "signup"
            ? "Get $100,000 mock cash to paper trade and save AI research reports."
            : "Sign in to access your paper trading desk and saved reports."}
        </div>

        {error && <div className="auth-error-badge">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="trader@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading
              ? mode === "signup"
                ? "Creating Account..."
                : "Signing In..."
              : mode === "signup"
              ? "Start Trading ($100k Mock Cash)"
              : "Sign In"}
          </button>
        </form>

        <div className="modal-footer">
          {mode === "signup" ? (
            <p>
              Already have an account?{" "}
              <button className="auth-switch-link" onClick={() => setMode("login")}>
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button className="auth-switch-link" onClick={() => setMode("signup")}>
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
