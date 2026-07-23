import { analyzeCompany } from "../agents/investmentAgent.js";
import { getStockData } from "./stockService.js";
import { getCompanyNews } from "./newsService.js";
import { getAiModel } from "./aiService.js";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

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

export async function chatWithAnalyst(message, history = [], companyName, stockData, news, analysis) {
  try {
    const model = getAiModel();

    // Construct the context to feed the AI
    const systemPrompt = `You are a Senior Investment Analyst Chatbot assisting a user with details about "${companyName}".
You have access to the following real-time research context for "${companyName}":

Live Stock Market Data:
${JSON.stringify(stockData, null, 2)}

Latest News & Headlines:
${JSON.stringify(news, null, 2)}

Executive Investment Report:
${JSON.stringify(analysis, null, 2)}

Answer the user's questions professionally, concisely, and with precise financial references. If the question is outside the financial scope or does not relate to "${companyName}", politely redirect them back to the stock analysis.`;

    const messages = [
      new SystemMessage(systemPrompt)
    ];

    // Add chat history
    if (Array.isArray(history)) {
      history.forEach(msg => {
        if (msg.role === "user") {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === "assistant" || msg.role === "model") {
          messages.push(new AIMessage(msg.content));
        }
      });
    }

    // Add the latest user message
    messages.push(new HumanMessage(message));

    const response = await model.invoke(messages);
    return response.content;
  } catch (error) {
    console.error("Chat With Analyst Service Error:", error);
    throw error;
  }
}