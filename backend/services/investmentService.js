import { analyzeCompany } from "../agents/investmentAgent.js";
import { getStockData } from "./stockService.js";
import { getCompanyNews } from "./newsService.js";
import { getAiModel } from "./aiService.js";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import prisma from "../utils/prisma.js";
import crypto from "crypto";

export async function analyzeInvestment(company) {
  try {
    // 1. Fetch live stock data to resolve ticker symbol and get current price
    const stockData = await getStockData(company);
    if (!stockData || !stockData.symbol) {
      throw new Error(`Failed to resolve stock data for "${company}"`);
    }

    // 2. Fetch latest news
    const latestNews = await getCompanyNews(company);

    // 3. Resilient Database Cache Check
    let cachedReport = null;
    try {
      const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
      cachedReport = await prisma.savedReport.findFirst({
        where: {
          symbol: stockData.symbol,
          createdAt: {
            gte: new Date(Date.now() - cacheDuration),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (dbErr) {
      console.warn("[Prisma Warning] Could not query savedReport cache:", dbErr.message);
    }

    if (cachedReport) {
      try {
        console.log(`[Cache Hit] Serving cached AI analysis for ${stockData.symbol}`);
        const cachedAnalysis = JSON.parse(cachedReport.analysisData);
        return {
          analysis: cachedAnalysis.analysis,
          marketAnalysis: cachedAnalysis.marketAnalysis,
          sentimentAnalysis: cachedAnalysis.sentimentAnalysis,
          marketData: stockData,
          latestNews,
        };
      } catch (parseErr) {
        console.warn("[Cache Warning] Corrupted cache JSON, proceeding to fresh AI analysis:", parseErr.message);
      }
    }

    // 4. Cache Miss: Run the LangGraph agent for deep analysis
    console.log(`[Cache Miss] Running LangGraph agent for: ${stockData.symbol} (${stockData.companyName})`);
    const agentResult = await analyzeCompany(
      company,
      stockData,
      latestNews
    );

    const analysisPayload = {
      analysis: agentResult.analysis,
      marketAnalysis: agentResult.marketAnalysis,
      sentimentAnalysis: agentResult.sentimentAnalysis,
    };

    // 5. Save the report to the database for future cache hits (Resilient)
    try {
      const shareId = crypto.randomBytes(8).toString("hex");
      await prisma.savedReport.create({
        data: {
          symbol: stockData.symbol,
          companyName: stockData.companyName || stockData.symbol,
          analysisData: JSON.stringify(analysisPayload),
          shareId,
        },
      });
    } catch (saveErr) {
      console.warn("[Prisma Warning] Could not persist savedReport to database:", saveErr.message);
    }

    return {
      ...analysisPayload,
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