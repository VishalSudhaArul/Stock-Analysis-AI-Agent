import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

console.log("Initializing LangChain ChatGoogleGenerativeAI...");

// Using the Langchain integration for Gemini for modern architecture
export const getAiModel = () => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-3.1-flash-lite",
    maxOutputTokens: 2048,
    apiKey: process.env.GEMINI_API_KEY,
  });
};