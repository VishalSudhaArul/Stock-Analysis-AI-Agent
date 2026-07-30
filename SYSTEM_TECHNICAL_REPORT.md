# 🚀 AI Investment Research & Paper Trading SaaS Platform
## Technical Architecture & Comprehensive Operations Report

---

## 📋 Executive Summary

The **AI Investment Research & Paper Trading SaaS Platform** is an enterprise-ready, production-grade financial analytics system designed to empower investors, analysts, and traders with multi-agent artificial intelligence. Built on Node.js, Vite/React, Prisma DB, and Google Gemini Pro, the platform seamlessly integrates stateful multi-agent research pipelines, real-time market scrapers, multi-currency portfolio tracking, and an interactive paper trading desk.

---

## 🏗️ 1. Complete Architecture Breakdown

```mermaid
graph TD
    User([👤 User / Investor]) -->|HTTP / React UI| Frontend[⚡ Vite + React Single Page App]
    Frontend -->|REST API Calls| Backend[🟢 Express.js REST API Server]
    
    subgraph AI Orchestration Engine
        Backend -->|Query Ticker| FastResolver[⚡ Fast-Path Ticker Resolver]
        FastResolver -->|Scrape Real-Time Quotes| GFinance[📊 Live Market Scraper]
        GFinance -->|News & Headlines| NewsAPI[📰 Financial News Aggregator]
        
        Backend -->|Stateful Execution| LangGraph[🧠 LangGraph Orchestrator]
        LangGraph --> Agent1[📈 Market Analyst Node]
        LangGraph --> Agent2[📰 Sentiment Analyst Node]
        LangGraph --> Agent3[🏛️ CIO Synthesis Node]
        
        Agent1 & Agent2 & Agent3 -->|Google Gemini 1.5 Pro| Gemini[🤖 Gemini AI Models]
    end
    
    subgraph Data & Persistence Layer
        Backend -->|Primary Storage| Prisma[🔷 Prisma ORM - MongoDB Atlas / SQLite]
        Backend -->|Resilience Fallback| MemoryJSON[💾 Local File JSON Ledger]
    end

    Frontend -->|Live Market Feed| AutoPoll[⏱️ 30s Background Auto-Poller]
    Frontend -->|20 World Currencies| FXEngine[🌐 FX Currency Converter]
```

---

## 🛠️ 2. Detailed Modules & Live Operational Outputs

### Module A: Multi-Agent AI Investment Research Engine
The research desk uses a 3-tier multi-agent pipeline powered by LangChain and LangGraph to perform deep quantitative and qualitative stock analyses.

1. **Market Analyst Node**: Computes RSI, MACD, Moving Averages (SMA 20/50/200), and support/resistance zones.
2. **Sentiment Analyst Node**: Processes 25+ real-time news headlines, scoring news sentiment from `-1.0` (Bearish) to `+1.0` (Bullish).
3. **CIO Synthesis Node**: Integrates technical and sentiment insights to issue an institutional recommendation (`STRONG BUY`, `BUY`, `HOLD`, `SELL`, or `STRONG SELL`) with a confidence score.

#### 💡 Sample Output Payload:
```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "recommendation": "STRONG BUY",
  "confidence": 88,
  "currentPrice": 338.19,
  "currency": "USD",
  "subAgentAnalyses": {
    "marketAnalyst": {
      "stance": "BULLISH",
      "summary": "RSI at 54.2 indicates healthy momentum. Trading above 50-day SMA ($325.40).",
      "metrics": ["RSI: 54.2", "MACD: +2.15 (Bullish Crossover)", "Support: $320.00"]
    },
    "sentimentAnalyst": {
      "stance": "BULLISH",
      "summary": "Positive market sentiment driven by strong iPhone sales forecasts and AI integration announcements.",
      "score": 0.76
    }
  }
}
```

---

### Module B: Persistent Paper Trading & Order Audit Ledger
The paper trading desk provides risk-free simulated trading with realistic execution math, holdings persistence, and chronological audit logging.

- **Initial Virtual Balance**: `$100,000.00 USD` (or equivalent in selected currency).
- **Order Execution Math**:
  $$\text{Average Buy Price} = \frac{\sum (\text{Shares Purchased} \times \text{Price})}{\sum \text{Shares Purchased}}$$
  $$\text{Unrealized P\&L} = (\text{Live Price} - \text{Average Buy Price}) \times \text{Holding Shares}$$
- **Features**:
  - **`⚡ Buy` Button**: Executes paper buy orders directly from the holdings table or AI research desk.
  - **`🔴 Sell` Button**: Pre-fills the execution modal set to `SELL` with max shares owned and a 1-click **"Sell All"** option.

#### 💡 Sample Holdings & Transaction Ledger Output:
```json
{
  "cashBalanceUSD": 90666.75,
  "holdings": [
    {
      "symbol": "AAPL",
      "companyName": "Apple Inc.",
      "shares": 25,
      "averageBuyPrice": 338.19,
      "currentPrice": 338.19,
      "currentValue": 8454.75,
      "pnl": 0.00,
      "currency": "USD"
    },
    {
      "symbol": "CIPLA",
      "companyName": "Cipla Ltd.",
      "shares": 50,
      "averageBuyPrice": 1467.10,
      "currentPrice": 1465.20,
      "currentValue": 73260.00,
      "pnl": -95.00,
      "currency": "INR"
    }
  ]
}
```

---

### Module C: Global 20-Currency Aggregation & Auto-Repair Engine
The platform handles global equities seamlessly across **20 major world currencies**.

#### Supported Currencies Matrix:
| Flag & Code | Currency | Symbol | FX Rate (Base 1 USD) |
| :--- | :--- | :--- | :--- |
| 🇺🇸 **USD** | US Dollar | `$` | `1.0` |
| 🇮🇳 **INR** | Indian Rupee | `₹` | `83.5` |
| 🇪🇺 **EUR** | Euro | `€` | `0.92` |
| 🇬🇧 **GBP** | British Pound | `£` | `0.78` |
| 🇯🇵 **JPY** | Japanese Yen | `¥` | `154.2` |
| 🇨🇦 **CAD** | Canadian Dollar | `C$` | `1.37` |
| 🇦🇺 **AUD** | Australian Dollar | `A$` | `1.52` |
| 🇨🇭 **CHF** | Swiss Franc | `CHF` | `0.88` |
| 🇨🇳 **CNY** | Chinese Yuan | `¥` | `7.25` |
| 🇭🇰 **HKD** | Hong Kong Dollar | `HK$` | `7.82` |
| 🇸🇬 **SGD** | Singapore Dollar | `S$` | `1.35` |
| 🇦🇪 **AED** | UAE Dirham | `AED` | `3.67` |
| 🇸🇦 **SAR** | Saudi Riyal | `SAR` | `3.75` |
| 🇰🇷 **KRW** | South Korean Won | `₩` | `1380.0` |
| 🇧🇷 **BRL** | Brazilian Real | `R$` | `5.65` |
| 🇲🇽 **MXN** | Mexican Peso | `Mex$` | `18.5` |
| 🇷🇺 **RUB** | Russian Ruble | `₽` | `86.0` |
| 🇿🇦 **ZAR** | South African Rand | `R` | `18.2` |
| 🇸🇪 **SEK** | Swedish Krona | `kr` | `10.7` |
| 🇳🇿 **NZD** | New Zealand Dollar | `NZ$` | `1.68` |

- **Auto-Repair Engine**: Converts international trades (e.g. buying CIPLA in INR) to USD before deducting cash from buying power, avoiding raw currency mismatch errors. Automatically repairs balances on fetch.

---

### Module D: Portfolio Diversification & AI Risk Engine
Visualizes concentration risk and sector allocation in real time.

- **Sector Progress Bars**: Displays percentages across Technology, Healthcare, Infrastructure, Energy, Automotive, etc.
- **Concentration Risk Ratings**:
  - 🟢 **Low Risk (Balanced)**: No single holding exceeds 30% of portfolio.
  - 🟡 **Moderate Risk**: Single holding exceeds 30% of portfolio value.
  - 🔴 **High Risk**: Single holding exceeds 50% of portfolio value.

---

### Module E: Technical Price Target & Stop-Loss Alerts
Traders can set custom technical profit targets and stop-loss warnings directly inside the paper trading execution modal.

- `🎯 Target Reached`: Badge displays when live market price $\ge$ target price.
- `🛑 Stop-Loss Triggered`: Badge displays when live market price $\le$ stop-loss threshold.

---

### Module F: 1-Click Institutional PDF Export
Users can export full AI investment reports into clean, print-ready PDF documents via the **`📥 Export PDF Report`** action button.

---

## 📡 3. REST API Endpoint Specification

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new SaaS user account | ❌ No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | ❌ No |
| `POST` | `/api/investment/analyze` | Run multi-agent AI analysis on ticker | 🔒 Yes (JWT) |
| `GET` | `/api/portfolio` | Fetch user portfolio, holdings & audit ledger | 🔒 Yes (JWT) |
| `POST` | `/api/portfolio/trade` | Execute paper `BUY` or `SELL` trade | 🔒 Yes (JWT) |
| `POST` | `/api/reports/share` | Generate public shareable URL for AI report | 🔒 Yes (JWT) |
| `GET` | `/api/reports/share/:id` | View public shared report | ❌ No |

---

## 🚀 4. Deployment & Quick Start Guide

### 1. Environment Setup (`.env`)
```env
PORT=5000
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/stock_agent"
GEMINI_API_KEY="AIzaSy..."
NEWS_API_KEY="news_api_key_..."
JWT_SECRET="super_secret_jwt_key"
```

### 2. Run Backend & Frontend Locally
```bash
# Terminal 1: Backend Server
cd backend
npm install
npm run dev

# Terminal 2: Frontend Client
cd frontend
npm install
npm run dev
```

---

## 🏆 Conclusion & Platform Status

The platform is **100% operational, fully resilient, and synchronized with GitHub**. All features—from 30-second market auto-polling and multi-currency aggregation to AI risk ratings and paper trading—are running in production.
