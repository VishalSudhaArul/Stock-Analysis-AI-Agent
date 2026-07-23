import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Navbar({ activeTab, setActiveTab, onOpenAuthModal, theme, toggleTheme }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-brand" onClick={() => setActiveTab("research")}>
          <span className="brand-icon">🤖</span>
          <span className="brand-text">AI Investment Desk</span>
          <span className="brand-tag">SaaS v2.0</span>
        </div>

        <div className="navbar-tabs">
          <button
            className={`nav-tab-btn ${activeTab === "research" ? "active" : ""}`}
            onClick={() => setActiveTab("research")}
          >
            🔍 AI Research
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "portfolio" ? "active" : ""}`}
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuthModal("login");
              } else {
                setActiveTab("portfolio");
              }
            }}
          >
            💼 Paper Trading & Portfolio
          </button>
        </div>

        <div className="navbar-right">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          {isAuthenticated ? (
            <div className="user-profile-menu">
              <button
                className="user-badge-btn"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <span className="user-avatar">👤</span>
                <span className="user-email">{user?.email?.split("@")[0]}</span>
                <span className="user-dropdown-arrow">▼</span>
              </button>

              {showDropdown && (
                <div className="profile-dropdown-menu animate-fade-in-up">
                  <div className="dropdown-user-info">
                    <p className="dropdown-email">{user?.email}</p>
                    <p className="dropdown-portfolio-id">Account ID: {user?.id?.substring(0, 8)}...</p>
                  </div>
                  <hr className="dropdown-divider" />
                  <button
                    className="dropdown-item logout"
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                      setActiveTab("research");
                    }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btn-group">
              <button
                className="nav-auth-btn secondary"
                onClick={() => onOpenAuthModal("login")}
              >
                Sign In
              </button>
              <button
                className="nav-auth-btn primary"
                onClick={() => onOpenAuthModal("signup")}
              >
                Get $100k Mock Cash
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
