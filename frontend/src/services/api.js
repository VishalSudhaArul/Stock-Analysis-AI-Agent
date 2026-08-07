import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach Authorization header automatically if token exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatically clean up stale or expired tokens on 401 Unauthorized responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/signup");
      if (!isAuthEndpoint) {
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);


// Auth API Calls
export const signupApi = async (email, password) => {
  const response = await API.post("/auth/signup", { email, password });
  return response.data;
};

export const loginApi = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data;
};

export const getMeApi = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

// AI Investment & Chat APIs
export const analyzeCompany = async (company) => {
  const response = await API.post("/investment/analyze", { company });
  return response.data;
};

export const chatWithAnalyst = async (message, history, companyName, stockData, news, analysis) => {
  const response = await API.post("/investment/chat", {
    message,
    history,
    companyName,
    stockData,
    news,
    analysis,
  });
  return response.data;
};

export const getScreenerApi = async (forceRefresh = false) => {
  const response = await API.get(`/investment/screener${forceRefresh ? "?refresh=true" : ""}`);
  return response.data;
};

// Reports API Calls
export const saveReportApi = async (symbol, companyName, analysisData) => {
  const response = await API.post("/reports/save", {
    symbol,
    companyName,
    analysisData,
  });
  return response.data;
};

export const getMyReportsApi = async () => {
  const response = await API.get("/reports/my-reports");
  return response.data;
};

export const getPublicReportApi = async (shareId) => {
  const response = await API.get(`/reports/public/${shareId}`);
  return response.data;
};

// Portfolio & Paper Trading APIs
export const getPortfolioApi = async () => {
  const response = await API.get("/portfolio");
  return response.data;
};

export const executeTradeApi = async (symbol, type, shares) => {
  const response = await API.post("/portfolio/trade", {
    symbol,
    type,
    shares,
  });
  return response.data;
};

// Watchlist APIs
export const getWatchlistApi = async () => {
  const response = await API.get("/portfolio/watchlist");
  return response.data;
};

export const addToWatchlistApi = async (symbol, companyName) => {
  const response = await API.post("/portfolio/watchlist", { symbol, companyName });
  return response.data;
};

export const removeFromWatchlistApi = async (symbol) => {
  const response = await API.delete(`/portfolio/watchlist/${encodeURIComponent(symbol)}`);
  return response.data;
};

// Macro, Quant Backtesting & Insider Audit APIs
export const getMacroApi = async () => {
  const response = await API.get("/investment/macro");
  return response.data;
};

export const runBacktestApi = async (strategy, timeframe) => {
  const response = await API.post("/investment/backtest", { strategy, timeframe });
  return response.data;
};

export const getInsiderAuditApi = async (symbol) => {
  const response = await API.get(`/investment/insider-audit?symbol=${encodeURIComponent(symbol || "AAPL")}`);
  return response.data;
};

export default API;