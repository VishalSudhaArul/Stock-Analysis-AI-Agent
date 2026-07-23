import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const CANDIDATE_MODELS = [
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

export const getAiModel = (modelIndex = 0) => {
  const modelName = CANDIDATE_MODELS[modelIndex % CANDIDATE_MODELS.length];
  return new ChatGoogleGenerativeAI({
    model: modelName,
    maxOutputTokens: 2048,
    apiKey: process.env.GEMINI_API_KEY,
  });
};

/**
 * Invokes Gemini with automatic model rotation fallback if 429 Rate Limit occurs.
 */
export async function invokeWithModelFallback(prompt, schema = null) {
  for (let i = 0; i < CANDIDATE_MODELS.length; i++) {
    try {
      const model = getAiModel(i);
      if (schema) {
        const structuredModel = model.withStructuredOutput(schema);
        return await structuredModel.invoke(prompt);
      } else {
        const response = await model.invoke(prompt);
        return response.content;
      }
    } catch (err) {
      console.warn(
        `[AI Model Fallback] Candidate model index ${i} (${CANDIDATE_MODELS[i % CANDIDATE_MODELS.length]}) failed: ${err.message}. Retrying next model...`
      );
      // Small pause before trying next candidate
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error("All AI models are currently rate-limited by Gemini API free tier.");
}