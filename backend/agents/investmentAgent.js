import { StateGraph, START, END } from "@langchain/langgraph";
import { getAiModel } from "../services/aiService.js";
import { z } from "zod";

// 1. Define the desired structured output schemas using Zod
const marketAnalysisSchema = z.object({
  financialScore: z.number().min(0).max(100).describe("Quantitative score representing financial health, valuation, and performance metrics (0-100)"),
  summary: z.string().describe("Executive summary of financial metrics and valuation analysis"),
  valuationStance: z.enum(["UNDERVALUED", "FAIRLY_VALUED", "OVERVALUED"]).describe("Valuation assessment"),
  keyMetricsEvaluated: z.array(z.string()).describe("List of key financial metrics evaluated and their status"),
});

const sentimentAnalysisSchema = z.object({
  sentimentScore: z.number().min(0).max(100).describe("Sentiment score where 0 is extremely negative, 50 is neutral, and 100 is extremely positive"),
  summary: z.string().describe("Executive summary of the news sentiment and public image"),
  sentimentStance: z.enum(["BULLISH", "NEUTRAL", "BEARISH"]).describe("News-based sentiment stance"),
  keyNewsThemes: z.array(z.string()).describe("Key themes or recurring topics found in the news headlines"),
});

const investmentSchema = z.object({
  company: z.string().describe("The full name of the company"),
  symbol: z.string().describe("The official stock ticker symbol"),
  overview: z.string().describe("A brief overview of the company"),
  industry: z.string().describe("The industry the company operates in"),
  strengths: z.array(z.string()).describe("List of core strengths"),
  weaknesses: z.array(z.string()).describe("List of weaknesses"),
  opportunities: z.array(z.string()).describe("List of growth opportunities"),
  risks: z.array(z.string()).describe("List of potential risks"),
  recommendation: z.enum(["BUY", "HOLD", "SELL"]).describe("Investment recommendation"),
  confidence: z.number().min(0).max(100).describe("Confidence score of the recommendation between 0-100"),
  reasoning: z.string().describe("Detailed reasoning behind the recommendation"),
});

// 2. Define the Agent State
const agentState = {
  company: {
    value: null,
  },
  stockData: {
    value: null,
  },
  news: {
    value: null,
  },
  marketAnalysis: {
    value: null,
  },
  sentimentAnalysis: {
    value: null,
  },
  analysis: {
    value: null,
  },
};

// 3. Define Graph Nodes
async function marketAnalystNode(state) {
  console.log(`[LangGraph Node] Market Analyst analyzing: ${state.company}`);
  const model = getAiModel();
  const structuredModel = model.withStructuredOutput(marketAnalysisSchema);
  
  const prompt = `You are a Senior Quantitative Financial Analyst. 
Analyze the financial health, key metrics, and valuation of "${state.company}" based on the following live stock data:
${JSON.stringify(state.stockData, null, 2)}

Provide a structured valuation, quantitative financial health score, and key observations.`;

  const response = await structuredModel.invoke(prompt);
  return { marketAnalysis: response };
}

async function sentimentAnalystNode(state) {
  console.log(`[LangGraph Node] Sentiment Analyst analyzing: ${state.company}`);
  const model = getAiModel();
  const structuredModel = model.withStructuredOutput(sentimentAnalysisSchema);
  
  const prompt = `You are a Senior Market Sentiment & News Analyst. 
Analyze the public sentiment, brand perception, and recent news trends of "${state.company}" based on these news articles:
${JSON.stringify(state.news, null, 2)}

Provide a structured market sentiment outlook, sentiment score, and key topics discussed.`;

  const response = await structuredModel.invoke(prompt);
  return { sentimentAnalysis: response };
}

async function investmentDecisionNode(state) {
  console.log(`[LangGraph Node] Chief Investment Officer synthesizing final decision for: ${state.company}`);
  const model = getAiModel();
  const structuredModel = model.withStructuredOutput(investmentSchema);
  
  const prompt = `You are the Chief Investment Officer (CIO) of a major investment fund. 
Synthesize the findings of your Market Analyst and Sentiment Analyst to produce the final investment decision for "${state.company}".

Market Analyst Report:
${JSON.stringify(state.marketAnalysis, null, 2)}

Sentiment Analyst Report:
${JSON.stringify(state.sentimentAnalysis, null, 2)}

Live Stock Data:
${JSON.stringify(state.stockData, null, 2)}

Latest News:
${JSON.stringify(state.news, null, 2)}

Synthesize a comprehensive, high-quality, professional investment report and final recommendation (BUY/HOLD/SELL).`;

  const response = await structuredModel.invoke(prompt);
  return { analysis: response };
}

// 4. Build and Compile the LangGraph (Sequential Pipeline)
const workflow = new StateGraph({ channels: agentState })
  .addNode("marketAnalyst", marketAnalystNode)
  .addNode("sentimentAnalyst", sentimentAnalystNode)
  .addNode("cio", investmentDecisionNode)
  .addEdge(START, "marketAnalyst")
  .addEdge("marketAnalyst", "sentimentAnalyst")
  .addEdge("sentimentAnalyst", "cio")
  .addEdge("cio", END);

const app = workflow.compile();

// 5. Main Export Function
export async function analyzeCompany(company, stockData, news) {
  try {
    console.log(`[LangGraph] Starting multi-agent execution for ${company}`);
    const finalState = await app.invoke({
      company,
      stockData,
      news
    });
    
    return {
      analysis: finalState.analysis,
      marketAnalysis: finalState.marketAnalysis,
      sentimentAnalysis: finalState.sentimentAnalysis,
    };
  } catch (error) {
    console.error("Investment Agent Error (LangGraph):", error);
    throw new Error("LangGraph Error: " + error.message);
  }
}