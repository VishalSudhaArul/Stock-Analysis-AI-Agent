import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import investmentRoutes from "./routes/investment.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/investment", investmentRoutes);

app.get("/check-env", (req, res) => {
  res.json({
    hasGemini: !!process.env.GEMINI_API_KEY,
    hasNews: !!process.env.NEWS_API_KEY,
    hasFinnhub: !!process.env.FINNHUB_API_KEY,
    finnhubValue: process.env.FINNHUB_API_KEY ? (process.env.FINNHUB_API_KEY.substring(0, 3) + "...") : "missing"
  });
});

app.get("/test-yahoo", async (req, res) => {
  try {
    const response = await fetch("https://www.google.com/finance/quote/AAPL:NASDAQ", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const html = await response.text();
    res.json({
      status: response.status,
      length: html.length,
      isBlocked: html.includes("captcha") || html.includes("detected unusual traffic"),
      snippet: html.substring(0, 1000)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "AI Investment Research Agent API is running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});