import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

export const investmentParser = StructuredOutputParser.fromZodSchema(
  z.object({
    company: z.string(),
    overview: z.string(),
    industry: z.string(),

    strengths: z.array(z.string()),

    weaknesses: z.array(z.string()),

    opportunities: z.array(z.string()),

    risks: z.array(z.string()),

    recommendation: z.enum(["BUY", "HOLD", "SELL"]),

    confidence: z.number(),

    reasoning: z.string(),
  })
);