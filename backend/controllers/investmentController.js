import {
  analyzeInvestment,
  chatWithAnalyst,
  getScreenerData,
  getMacroData,
  runBacktest,
  getSecInsiderAudit,
} from "../services/investmentService.js";

export async function analyze(req, res) {
  try {
    const { company } = req.body;

    if (!company) {
      return res.status(400).json({
        success: false,
        error: "Company name is required",
      });
    }

    const result = await analyzeInvestment(company);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Analyze Controller Error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze company",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

export async function chat(req, res) {
  try {
    const { message, history, companyName, stockData, news, analysis } = req.body;

    if (!message || !companyName) {
      return res.status(400).json({
        success: false,
        error: "Message and Company name are required",
      });
    }

    const reply = await chatWithAnalyst(message, history, companyName, stockData, news, analysis);

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Chat failed",
    });
  }
}

export async function getScreener(req, res) {
  try {
    const forceRefresh = req.query.refresh === "true";
    const data = await getScreenerData(forceRefresh);
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Screener Controller Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch screener data",
    });
  }
}

export async function getMacro(req, res) {
  try {
    const data = await getMacroData();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Macro Controller Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch macro data",
    });
  }
}

export async function postBacktest(req, res) {
  try {
    const { strategy, timeframe } = req.body;
    const data = await runBacktest(strategy, timeframe);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Backtest Controller Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to run backtest",
    });
  }
}

export async function getInsiderAudit(req, res) {
  try {
    const symbol = req.query.symbol || "AAPL";
    const data = await getSecInsiderAudit(symbol);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Insider Audit Controller Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch insider audit",
    });
  }
}