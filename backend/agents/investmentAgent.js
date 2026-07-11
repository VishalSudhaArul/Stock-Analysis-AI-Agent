import { StateGraph, START, END } from "@langchain/langgraph";
import { getAiModel } from "../services/aiService.js";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// 1. Define the desired structured output using Zod
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
  analysis: {
    value: null,
  },
};

// 3. Define the Prompt Template
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "You are an elite Senior Investment Analyst. Your job is to analyze a company and provide a structured investment recommendation based on live market data and news."],
  ["human", "Please analyze {company}.\n\nLive Stock Data:\n{stockData}\n\nLatest News:\n{news}\n\nUse this data to give a highly accurate recommendation."]
]);

// 4. Define Graph Nodes
async function analyzeNode(state) {
  console.log(`[LangGraph Node] Analyzing company: ${state.company}`);
  
  const model = getAiModel();
  
  // Bind the schema to force the model to return structured JSON
  const structuredModel = model.withStructuredOutput(investmentSchema);
  
  const prompt = await promptTemplate.format({
    company: state.company,
    stockData: JSON.stringify(state.stockData, null, 2),
    news: JSON.stringify(state.news, null, 2),
  });

  const response = await structuredModel.invoke(prompt);
  
  return { analysis: response };
}

// 5. Build and Compile the LangGraph
const workflow = new StateGraph({ channels: agentState })
  .addNode("analyze", analyzeNode)
  .addEdge(START, "analyze")
  .addEdge("analyze", END);

const app = workflow.compile();

// 6. Main Export Function
export async function analyzeCompany(company, stockData, news) {
  try {
    console.log(`[LangGraph] Starting execution for ${company}`);
    const finalState = await app.invoke({
      company,
      stockData,
      news
    });
    
    return finalState.analysis;
  } catch (error) {
    console.error("Investment Agent Error (LangGraph):", error);
    throw new Error("LangGraph Error: " + error.message);
  }
}