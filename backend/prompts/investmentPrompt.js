// import { ChatPromptTemplate } from "@langchain/core/prompts";

// export const investmentPrompt = ChatPromptTemplate.fromTemplate(`
// You are a Senior Investment Research Analyst.

// Analyze the company: {company}

// Return ONLY valid JSON.

// Use this EXACT structure:

// {{
//   "company": "Full Company Name",
//   "symbol": "Official Stock Symbol",
//   "overview": "Brief company overview",
//   "industry": "Industry",
//   "strengths": [
//     "Strength 1",
//     "Strength 2",
//     "Strength 3"
//   ],
//   "weaknesses": [
//     "Weakness 1",
//     "Weakness 2",
//     "Weakness 3"
//   ],
//   "opportunities": [
//     "Opportunity 1",
//     "Opportunity 2",
//     "Opportunity 3"
//   ],
//   "risks": [
//     "Risk 1",
//     "Risk 2",
//     "Risk 3"
//   ],
//   "recommendation": "BUY",
//   "confidence": 85,
//   "reasoning": "Explain the recommendation."
// }}

// Rules:

// - Return ONLY JSON.
// - No markdown.
// - No code block.
// - symbol must be the official stock ticker (Example: Apple → AAPL).
// - recommendation must be one of:
//   BUY
//   HOLD
//   SELL
// - confidence must be an integer between 0 and 100.
// `);




import { ChatPromptTemplate } from "@langchain/core/prompts";

export const investmentPrompt = ChatPromptTemplate.fromTemplate(`
You are a senior investment analyst.

Analyze the following company using:

Company:
{company}

Live Stock Data:
{stockData}

Latest News:
{news}

Return ONLY valid JSON.

{{
  "company":"",
  "symbol":"",
  "overview":"",
  "industry":"",
  "strengths":[],
  "weaknesses":[],
  "opportunities":[],
  "risks":[],
  "recommendation":"",
  "confidence":0,
  "reasoning":""
}}

Rules:
- Use the stock data when giving recommendations.
- Consider the latest news.
- Confidence must be a number between 0 and 100.
- Return only JSON.
- Do not return markdown.
`);