import { analyzeInvestment } from "../services/investmentService.js";

export async function analyze(req, res) {
  try {
    const { company } = req.body;

    if (!company) {
      return res.status(400).json({
        error: "Company name is required",
      });
    }

    const result = await analyzeInvestment(company);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}