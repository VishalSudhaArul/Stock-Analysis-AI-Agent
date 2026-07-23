import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

console.log("Initializing LangChain ChatGoogleGenerativeAI...");

// Using the production-tested Gemini model for structured agent outputs
export const getAiModel = () => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-flash-latest",
    maxOutputTokens: 2048,
    apiKey: process.env.GEMINI_API_KEY,
  });
};