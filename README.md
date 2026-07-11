# AI Investment Research Agent

## Overview
The AI Investment Research Agent is an intelligent web application built to analyze publicly traded companies and provide clear, data-driven investment recommendations (BUY, HOLD, SELL). It aggregates live stock market data, fetches the latest news articles for market sentiment, and processes this information through an advanced AI model using a structured LangGraph state pipeline to generate comprehensive, confident analysis.

## Setup and Run Instructions

### Prerequisites
- Node.js (v18 or higher)
- NPM or Yarn
- Gemini API Key (or OpenAI key if re-configured)
- Yahoo Finance & News APIs are automatically handled.

### 1. Backend Setup
1. Open terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend root directory (if not exists) and add your keys:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on http://localhost:5000.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at http://localhost:5173.*

## How it works (Approach & Architecture)
**Architecture:**
- **Frontend (React + Vite):** A responsive, glassmorphism-themed UI designed for a premium user experience. It takes the company name, manages loading states, and dynamically renders the structured data received from the backend.
- **Backend (Node.js + Express):** Acts as the orchestrator.
  - Exposes a robust REST API `/api/investment`.
  - Integrates `yahoo-finance2` for real-time market data.
  - Fetches the latest news articles for the given company for sentiment context.
- **AI Core (LangGraph + LangChain):** 
  - Instead of raw API calls, I engineered a **LangGraph StateGraph** to orchestrate the AI analysis.
  - The model uses `ChatGoogleGenerativeAI` enhanced with `.withStructuredOutput(schema)` using Zod. This absolutely guarantees the AI returns a perfect JSON object every time without needing regex cleanup, making it highly fault-tolerant.

**Flow:**
`User Input -> Express API -> Fetch Stock Data -> Fetch News Data -> Inject into LangGraph State -> AI Generates Structured Response -> Return to Frontend`

## Key Decisions & Trade-offs
1. **LangGraph over raw LangChain:** While a simple prompt would suffice for a single call, using LangGraph establishes a foundation for future scalability. If we wanted to add a "Data Verification Agent" or a "Sentiment Analysis Agent", the graph architecture makes adding these nodes trivial.
2. **Structured Outputs (Zod) vs Raw JSON Prompting:** I strictly typed the output schema using Zod. This prevents the classic "JSON parse error" that happens when LLMs randomly add markdown backticks.
3. **Vanilla CSS over Tailwind:** I opted to build a custom CSS design system to demonstrate raw frontend capability, absolute flexibility, and out-of-the-box performance without heavy utility class injection, ensuring a unique, non-templated premium look.
4. **Trade-off:** To meet the 7-day timeline efficiently, I passed all context (Stock + News) in a single massive prompt to the final decision node rather than spinning up multiple sub-agents. It's faster and uses fewer tokens but sacrifices highly specialized deep-dives into single articles.

## Example Runs

**Run 1: "Nvidia" (NVDA)**
- **Recommendation:** BUY (Confidence: 90%)
- **Reasoning:** Sustained dominance in the AI hardware sector, robust revenue growth outpacing market expectations, and critical partnerships securing future supply chains. P/E ratio is high, but growth justifies the premium.
- **Strengths:** Near-monopoly in AI GPUs, strong cash flow.
- **Risks:** Geopolitical tensions affecting semiconductor manufacturing (TSMC dependency).

**Run 2: "Intel" (INTC)**
- **Recommendation:** SELL (Confidence: 85%)
- **Reasoning:** Continuing to lose market share to AMD in server CPUs and struggling to gain traction in the AI accelerator space. Restructuring costs are heavily eating into margins.
- **Strengths:** Strong legacy footprint, US government CHIPS Act funding.
- **Risks:** Continued delays in foundry advancements.

## What I would improve with more time
1. **Multi-Agent Architecture:** I would expand the LangGraph to have distinct agents: A *Market Analyst Agent* (only looks at numbers), a *Sentiment Agent* (only reads news), and a *Head of Investment Agent* that debates the findings of the first two before giving a final verdict.
2. **Database Integration:** I would integrate PostgreSQL (using Prisma ORM) to cache previous analysis for 24 hours to save API costs and speed up response times for popular tickers like Apple or Tesla.
3. **Interactive Charts:** Add Recharts or Chart.js on the frontend to visualize the 52-week stock trends rather than just showing raw numbers.
4. **Auth & Portfolios:** Allow users to create accounts, save their analysis, and track a mock portfolio based on the AI's recommendations.
