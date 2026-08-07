# 🤖 Stock Analysis AI Agent — Enterprise AI Investment SaaS Platform

[![Live Website](https://img.shields.io/badge/Live_Website-v2.0_Active-00C853?style=for-the-badge&logo=vercel)](https://stock-analysis-ai-agent.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/VishalSudhaArul/Stock-Analysis-AI-Agent)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![LangGraph](https://img.shields.io/badge/AI_Engine-LangGraph_Gemini-FF6F00?style=for-the-badge&logo=google)](https://langchain.com/)

> **Stock Analysis AI Agent** is an enterprise-grade AI Investment Research & Paper Trading SaaS platform. It combines a stateful multi-agent AI engine (**LangGraph** + **Google Gemini**), real-time market scrapers, multi-currency detection (INR ₹ / USD $), interactive paper trading desk with zero-latency symbol resolution, and passive dividend yield & DRIP compounding forecaster.

---

## 🌐 Live Platform & Links

* ⚡ **Live Web Application**: [https://stock-analysis-ai-agent.vercel.app/](https://stock-analysis-ai-agent.vercel.app/)
* 📦 **GitHub Repository**: [https://github.com/VishalSudhaArul/Stock-Analysis-AI-Agent](https://github.com/VishalSudhaArul/Stock-Analysis-AI-Agent)

---

## 🏛️ System Architecture

```
                             React Frontend (Vite + Glassmorphism UI)
                                                │
                                                ▼
                             Node.js / Express REST API Engine
                                                │
       ┌────────────────────────────────────────┼────────────────────────────────────────┐
       ▼                                        ▼                                        ▼
Real-Time Market Data Engine          Multi-Agent AI Pipeline (LangGraph)         User Session & Storage
  ├─ Fast-Path Ticker Resolver          ├─ Market Analyst (Financial Health)       ├─ Prisma MongoDB Atlas / SQLite
  ├─ Google Finance Live Scraper        ├─ Sentiment Analyst (RSS & News)          ├─ Persistent JSON Fallback Ledger
  ├─ Yahoo Finance Historical API       └─ Chief Investment Officer (CIO)          └─ JWT Authentication
  └─ RSS XML Fallback Parser
```

### 🧠 LangGraph Stateful Multi-Agent Graph Flow

```
                           ┌───────────────────────────┐
                           │   Input Stock Query       │
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │   Fast-Path Resolution    │
                           └─────────────┬─────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
   ┌───────────────────────────────┐           ┌───────────────────────────────┐
   │  Market Analyst Agent         │           │  Sentiment Analyst Agent      │
   │  • Financial Score (0-100)    │           │  • News Sentiment (0-100)     │
   │  • Key Metrics Evaluation     │           │  • RSS Headline Extraction    │
   │  • Valuation Stance           │           │  • Market Stance              │
   └───────────────┬───────────────┘           └───────────────┬───────────────┘
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │   CIO Synthesis Node      │
                           │   • Final Action (BUY/SELL)│
                           │   • Confidence Score (%)  │
                           │   • Investment Thesis     │
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │ Structured JSON Response  │
                           └───────────────────────────┘
```

---

## 🔥 Key Features & Capabilities

### 1. ⏱️ Real-Time Market Data Feed & 30-Second Polling
- **Active Market Synchronizer**: Paper trading portfolio auto-refreshes every **30 seconds** with live price ticks, updating unrealized PnL and total portfolio value in real time.
- **Fast-Path Ticker Resolver**: In-memory static & dynamic cache resolves company names to Google Finance exchange tickers (`AAPL:NASDAQ`, `CIPLA:NSE`, `TATAMOTORS:NSE`) in **<50ms**, eliminating LLM latency bottlenecks.
- **Resilient Multi-Tier Scraper**: Scrapes Google Finance live HTML, falling back seamlessly to Yahoo Finance and Google News RSS XML parser to guarantee 100% data availability.

### 2. 💱 Global Multi-Currency Support (INR ₹ & USD $)
- **Automatic Exchange Detection**: Automatically identifies asset origin based on ticker exchange (`NSE`/`BOM` -> **₹ INR**, `NASDAQ`/`NYSE` -> **$ USD**).
- **Localized UI Representation**: Formats buying power, average buy prices, transaction ledgers, and unrealized return gauges in the stock's native currency.

### 3. 📈 Robinhood-Style Paper Trading Desk & Persistent Ledger
- **Virtual $100,000 / ₹100,000 Portfolio**: Execute instant paper `BUY` and `SELL` orders with real-time price execution.
- **Chronological Accounting Engine**: Computes weighted average buy prices and active stock positions chronologically (oldest-to-newest), preventing position loss or false zero-share states.
- **Persistent JSON & Cloud Storage**: Portfolio balances and transaction ledgers persist seamlessly via **Prisma MongoDB Atlas** and a local JSON file-backed ledger (`backend/data/memoryPortfolios.json`).

### 4. 🤖 Institutional AI Features & Quantitative Modules
- **🌐 Macroeconomic Strategist Agent (`MacroEconomicPulse.jsx`)**: Real-time Federal Reserve monetary policy metrics, CPI inflation, 10Y yields, and AI sector allocation matrix.
- **📈 AI Quant Backtester & Strategy Simulator (`StrategyBacktester.jsx`)**: Multi-factor Monte Carlo backtesting engine for AI Sentiment Momentum, Buffett Deep Value, Dividend Compounder, and Volatility Breakout.
- **🧮 DCF Intrinsic Fair Value Model (`DCFValuationCalculator.jsx`)**: Discounted Cash Flow 5-year valuation calculator with customizable WACC, FCF growth rate, and Bear/Base/Bull target scenarios.
- **🕵️‍♂️ SEC 10-K & C-Suite Insider Audit Tracker (`SecInsiderAudit.jsx`)**: Form 4 insider trading log (CEO/CFO actions), institutional ownership %, and 10-K audit health score.
- **⚡ Automated Trading Rules & Webhook Signals (`AutoTradingRules.jsx`)**: Conditional execution engine for automated stop-loss, RSI accumulation, and sentiment triggers.
- **Speedometer Health Gauges**: Visual SVG gauge meters displaying Financial Health Score and Sentiment Stance.
- **Multi-Turn RAG Chat Assistant (`AnalystChat.jsx`)**: Contextual follow-up Q&A directly with the AI Investment Agent for deep-dive earnings analysis.
- **Side-by-Side Stock Comparison Matrix (`CompareMatrix.jsx`)**: Compare active stock analysis against watchlist items across 10+ financial metrics.
- **Viral Public Report Publishing**: Share institutional-quality AI analysis reports via public URLs (`/reports/:shareId`) with cached model responses and live market updates.


---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router DOM, Custom Glassmorphism CSS System, Recharts / SVG Gauges.
- **Backend**: Node.js, Express.js, LangGraph JS (`@langchain/langgraph`), Google Gemini API (`@google/genai`).
- **Database & Auth**: Prisma ORM, MongoDB Atlas / SQLite, JWT, BcryptJS, File JSON Storage.
- **Data Sourcing**: Google Finance Scraper, Yahoo Finance 2 API, NewsAPI, Google News RSS Parser.

---

## ⚙️ Installation & Local Setup

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get key here](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/VishalSudhaArul/Stock-Analysis-AI-Agent.git
cd Stock-Analysis-AI-Agent
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NEWS_API_KEY=your_news_api_key_here_optional
JWT_SECRET=your_jwt_secret_key_here
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/stock_agent
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 📑 API Reference

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/investment/analyze` | POST | Triggers multi-agent stock analysis | No |
| `/api/investment/chat` | POST | RAG contextual chat with AI Analyst | No |
| `/api/portfolio` | GET | Fetches user paper portfolio & holdings | Yes |
| `/api/portfolio/trade` | POST | Executes mock BUY/SELL paper order | Yes |
| `/api/reports/save` | POST | Saves AI report and generates shareable URL | Yes |
| `/api/reports/:shareId` | GET | Resolves public shared report | No |
| `/api/auth/register` | POST | User registration & $100k account setup | No |
| `/api/auth/login` | POST | User authentication & JWT token dispatch | No |

---

## 📊 Sample Output & Execution

### 🔹 Indian Equity Analysis — IRFC (NSE)
- **Symbol**: `IRFC:NSE`
- **Currency**: `INR ₹`
- **Recommendation**: **BUY** (Confidence: 88%)
- **Market Health Score**: `82/100`
- **Sentiment Stance**: `Bullish (78/100)`
- **Key Thesis**: Strong government backing, robust order pipeline in Indian railway infrastructure, solid profit margins.

### 🔹 US Tech Equity Analysis — NVIDIA (NVDA)
- **Symbol**: `NVDA:NASDAQ`
- **Currency**: `USD $`
- **Recommendation**: **BUY** (Confidence: 92%)
- **Market Health Score**: `94/100`
- **Sentiment Stance**: `Bullish (90/100)`
- **Key Thesis**: Dominant market position in AI data center GPUs and CUDA software moat.

---

## 📜 License & Author

Developed by **Vishal Sudha Arul**.
Licensed under the [MIT License](LICENSE).
