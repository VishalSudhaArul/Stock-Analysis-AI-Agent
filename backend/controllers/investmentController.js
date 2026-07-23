import { analyzeInvestment, chatWithAnalyst } from "../services/investmentService.js";

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