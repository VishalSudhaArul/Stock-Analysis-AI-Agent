# AI Investment Research Agent

A professional-grade, intelligent SaaS web application built to analyze publicly traded companies and provide clear, data-driven investment recommendations (BUY, HOLD, SELL). It aggregates live stock market data, fetches the latest news articles for sentiment context, and orchestrates analysis through a multi-agent LangGraph state pipeline to generate structured, institutional-quality investment reports.

Now upgraded with a secure database layer and user authentication to support persistent watchlists, saved reports, and mock portfolio simulation.

---

## 🚀 Live Demo & Repository
* **Live Website**: [https://stock-analysis-ai-agent.vercel.app/](https://stock-analysis-ai-agent.vercel.app/)
* **Backend API**: [https://stock-analysis-ai-agent.onrender.com/](https://stock-analysis-ai-agent.onrender.com/)
* **GitHub Repository**: [https://github.com/VishalSudhaArul/Stock-Analysis-AI-Agent](https://github.com/VishalSudhaArul/Stock-Analysis-AI-Agent)

---

## 🏗️ Architecture & How It Works

The platform uses a decoupled frontend-backend architecture integrated with a stateful AI agent graph:

```
                  React Frontend (Vite)
                           │
                           ▼
                    Express Backend ◄─────────► Database (Prisma + SQLite)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  Company Profile      Stock Data        Latest News
  (Google Finance)  (Yahoo/Finnhub)      (NewsAPI)
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                 LangGraph AI Orchestrator
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    Market Analyst  Sentiment Analyst      CIO Node
    (Financials)       (News/Sentiment)   (Final Recommendation)
                           │
                           ▼
                Structured JSON Output ──► Dashboard UI
```

### LangGraph Stateful Analysis Pipeline:
1. **Market Analyst Node**: Evaluates qualitative and quantitative financial metrics from real-time stock APIs.
2. **Sentiment Analyst Node**: Analyzes recent press releases and headlines to establish a public sentiment stance.
3. **Chief Investment Officer (CIO) Node**: Synthesizes the analysis from the Market and Sentiment analysts to make a structured final decision (BUY/HOLD/SELL) and writes a comprehensive investment reasoning.

---

## 🗄️ Database & Security Architecture
We use **Prisma ORM** coupled with a local **SQLite** database for development (easily configured for PostgreSQL in production). 

### Schema Models:
* **User**: Manages authenticated client profiles. Passwords are secured using `bcryptjs` one-way hashing.
* **WatchlistItem**: Stores users' pinned stocks, synchronized across devices.
* **Portfolio**: Created automatically upon signup with a default balance of **$100,000** for mock paper trading.
* **Transaction**: Logs all mock buy/sell actions to track portfolio performance.
* **SavedReport**: Caches AI analysis results against a unique `shareId` to prevent duplicate AI model calls and enable viral public report sharing.

---

## 🛠️ Setup and Run Instructions

### Prerequisites
* **Node.js** (v18 or higher)
* **NPM** or **Yarn**
* **Gemini API Key** (for agent analysis)
* **News API Key** (for sentiment sourcing)

### 1. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` configuration file in the backend root:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   NEWS_API_KEY=your_news_api_key_here
   DATABASE_URL="file:./dev.db"
   JWT_SECRET=your_jwt_signing_secret_here
   ```
4. Run database migrations to set up SQLite:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server starts on http://localhost:5000.*

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
   *The client will be running at http://localhost:5173.*

---

## 💡 Key Decisions & Trade-offs
1. **LangGraph over Raw LLM Chains**: Utilizing a state graph ensures structured routing of context, laying the groundwork to expand with specialized debate agents or verification loops.
2. **Prisma ORM Database Migration**: Migrating from localized client storage (`localStorage`) to a structured relational schema enables cross-device synchronization, secure sessions, and viral shared URLs.
3. **Structured Outputs (Zod Validation)**: Output formatting is strictly enforced via schemas at each node of our agent graph. This eliminates JSON parsing failures.
4. **CSS-First Design System**: Opting for a bespoke CSS system instead of a generic framework demonstrates raw design capabilities and results in a highly customized glassmorphic workspace.

---

## 📈 Verification & Example Runs

### 🟢 Nvidia (NVDA)
* **Recommendation**: BUY (Confidence: 90%)
* **Reasoning**: Sustained dominance in the AI hardware sector, robust revenue growth outpacing market expectations, and critical partnerships securing future supply chains. P/E ratio is high, but growth justifies the premium.
* **Strengths**: Near-monopoly in AI GPUs, strong cash flow.
* **Risks**: Geopolitical tensions affecting semiconductor manufacturing (TSMC dependency).

### 🔴 Intel (INTC)
* **Recommendation**: SELL (Confidence: 85%)
* **Reasoning**: Continuing to lose market share to AMD in server CPUs and struggling to gain traction in the AI accelerator space. Restructuring costs are heavily eating into margins.
* **Strengths**: Strong legacy footprint, US government CHIPS Act funding.
* **Risks**: Continued delays in foundry advancements.

---

## 🗺️ Product Roadmap

* [x] **Phase 1**: Multi-Agent LangGraph Orchestrator (Market + Sentiment analysis).
* [x] **Phase 2**: Real-time Financial Scraping (Google Finance symbol resolver + Yahoo Finance API).
* [x] **Phase 3**: User Authentication & Relational Database setup (JWT + Prisma ORM + Default Portfolio).
* [ ] **Phase 4**: Report Caching & Viral Publishing (Milestone 2 - *In Progress*).
* [ ] **Phase 5**: Interactive Paper Trading Dashboard (Milestone 3).
* [ ] **Phase 6**: PDF Document Upload & RAG (Earnings transcripts / 10-Ks).
