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

export default API;