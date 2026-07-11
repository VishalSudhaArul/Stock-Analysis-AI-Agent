import { analyzeCompany } from "../agents/investmentAgent.js";
import { getStockData } from "./stockService.js";
import { getCompanyNews } from "./newsService.js";

export async function analyzeInvestment(company) {
  try {
    // 1. Fetch live stock data
    const stockData = await getStockData(company);

    // 2. Fetch latest news
    const latestNews = await getCompanyNews(company);

    // 3. AI analyzes using live data
    const analysis = await analyzeCompany(
      company,
      stockData,
      latestNews
    );

    return {
      analysis,
      marketData: stockData,
      latestNews,
    };
  } catch (error) {
    console.error("Investment Service Error:", error);
    throw error;
  }
}