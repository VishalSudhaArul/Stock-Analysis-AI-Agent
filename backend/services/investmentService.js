import { analyzeCompany } from "../agents/investmentAgent.js";
import { getStockData } from "./stockService.js";
import { getCompanyNews } from "./newsService.js";

export async function analyzeInvestment(company) {
  try {
    // 1. Fetch live stock data
    const stockData = await getStockData(company);

    // 2. Fetch latest news
    const latestNews = await getCompanyNews(company);

    const result = await analyzeCompany(
      company,
      stockData,
      latestNews
    );

    return {
      analysis: result.analysis,
      marketAnalysis: result.marketAnalysis,
      sentimentAnalysis: result.sentimentAnalysis,
      marketData: stockData,
      latestNews,
    };
  } catch (error) {
    console.error("Investment Service Error:", error);
    throw error;
  }
}