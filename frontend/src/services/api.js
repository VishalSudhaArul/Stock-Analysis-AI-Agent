import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const analyzeCompany = async (company) => {
  const response = await API.post("/investment/analyze", {
    company,
  });

  return response.data;
};