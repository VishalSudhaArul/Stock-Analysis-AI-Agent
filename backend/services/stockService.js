import YahooFinance from "yahoo-finance2";
import axios from "axios";
import { COMPANY_SYMBOLS } from "../utils/companySymbols.js";
import { getAiModel } from "./aiService.js";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

// Helper: Parse currency strings to float
function parseCurrencyString(val) {
  if (!val || val === "N/A" || val === "-") return null;
  const cleaned = val.replace(/[$,₹\s,]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Helper: Parse market cap strings (e.g. 4.63T, 285.29B) to full numbers
function parseMarketCap(val) {
  if (!val || val === "N/A" || val === "-") return null;
  const cleaned = val.replace(/[$,₹\s,]/g, "");
  const multiplier = cleaned.slice(-1).toUpperCase();
  const num = parseFloat(cleaned.slice(0, -1));
  if (isNaN(num)) {
    const rawNum = parseFloat(cleaned);
    return isNaN(rawNum) ? null : rawNum;
  }
  if (multiplier === "T") return Math.round(num * 1000000000000);
  if (multiplier === "B") return Math.round(num * 1000000000);
  if (multiplier === "M") return Math.round(num * 1000000);
  if (multiplier === "K") return Math.round(num * 1000);
  
  const rawNum = parseFloat(cleaned);
  return isNaN(rawNum) ? null : rawNum;
}

// AI Symbol Resolver using Gemini
async function resolveSymbolWithAI(company) {
  try {
    const model = getAiModel();
    const prompt = `You are a financial stock symbol resolver. 
Given a company name or query, return ONLY its Google Finance stock ticker in the format SYMBOL:EXCHANGE (e.g., Apple -> AAPL:NASDAQ, Infosys -> INFY:NSE, Cupid -> CUPID:NSE, Tesla -> TSLA:NASDAQ, Tata Motors -> TATAMOTORS:NSE, Nvidia -> NVDA:NASDAQ). 
If the company trades on multiple exchanges, prioritize US exchanges (NASDAQ or NYSE) or Indian exchanges (NSE) if it's an Indian company. 
Return ONLY the ticker string, nothing else. Do not include any markdown, spaces, or extra characters.

Company name: "${company}"
Ticker:`;

    const response = await model.invoke(prompt);
    const ticker = response.content.trim().toUpperCase();
    console.log(`AI resolved "${company}" to Google Finance ticker: ${ticker}`);
    return ticker;
  } catch (error) {
    console.error("AI symbol resolution error:", error.message);
    return null;
  }
}

// Google Finance scraper
async function getGoogleFinanceData(company) {
  // Step 1: Resolve symbol using AI
  const ticker = await resolveSymbolWithAI(company);
  if (!ticker || !ticker.includes(":")) {
    throw new Error(`Could not resolve Google Finance ticker for "${company}"`);
  }

  // Step 2: Fetch HTML from Google Finance
  console.log(`Fetching Google Finance HTML for ${ticker}...`);
  const response = await fetch(`https://www.google.com/finance/quote/${ticker}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`Google Finance returned HTTP ${response.status}`);
  }

  const html = await response.text();

  // 1. Company Name
  const nameMatch = html.match(/<div class="gO24Ff">([^<]+)<\/div>/);
  const companyName = nameMatch ? nameMatch[1] : company;

  // 2. Current Price
  const priceDivMatch = html.match(/<div[^>]*class="[^"]*N6SYTe[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  let priceStr = null;
  if (priceDivMatch) {
    const valMatch = priceDivMatch[1].match(/\$?₹?([0-9,]+\.[0-9]+)/);
    if (valMatch) priceStr = valMatch[1];
  }
  if (!priceStr) {
    const valMatch = html.match(/jsname="Pdsbrc"[^>]*><span>([^<]+)<\/span>/);
    if (valMatch) priceStr = valMatch[1];
  }
  const currentPrice = parseCurrencyString(priceStr);

  // 3. Key Stats Table
  const keyStatsRegex = /<div class="SwQK7">([^<]+)<\/div><div class="dO6ijd">([^<]+)<\/div>/g;
  let match;
  const stats = {};
  while ((match = keyStatsRegex.exec(html)) !== null) {
    stats[match[1]] = match[2];
  }

  // 4. Sector
  const sectorMatch = html.match(/<span class="OspXqd">Sector<\/span><span class="oJCxTc">([^<]+)<\/span>/);
  const sector = sectorMatch ? sectorMatch[1] : "Technology";

  // Determine Currency based on ticker/exchange
  const currency = ticker.endsWith("NSE") || ticker.endsWith("BOM") ? "INR" : "USD";
  const exchange = ticker.split(":")[1] || "US";

  return {
    symbol: ticker.split(":")[0],
    companyName: companyName,
    currentPrice: currentPrice,
    previousClose: parseCurrencyString(stats["Open"]), // Fallback to Open if Close not available
    marketCap: parseMarketCap(stats["Mkt. cap"]),
    currency: currency,
    exchange: exchange,
    fiftyTwoWeekHigh: parseCurrencyString(stats["52-wk high"]),
    fiftyTwoWeekLow: parseCurrencyString(stats["52-wk low"]),
    peRatio: parseCurrencyString(stats["P/E ratio"]),
    eps: parseCurrencyString(stats["EPS"]),
    sector: sector,
    industry: sector, // Duplicate sector to industry for consistency
    dataSource: "Google Finance"
  };
}

// Finnhub integration (Optional fallback)
async function getFinnhubData(company, apiKey) {
  const searchUrl = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(company)}&token=${apiKey}`;
  const searchRes = await axios.get(searchUrl);
  
  if (!searchRes.data.result || searchRes.data.result.length === 0) {
    throw new Error(`Symbol not found for company: ${company}`);
  }
  
  const symbol = searchRes.data.result[0].symbol;
  
  const [quoteRes, profileRes, metricRes] = await Promise.all([
    axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`),
    axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`),
    axios.get(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`)
  ]);

  const quote = quoteRes.data;
  const profile = profileRes.data;
  const metrics = metricRes.data.metric || {};

  return {
    symbol: symbol,
    companyName: profile.name || searchRes.data.result[0].description || company,
    currentPrice: quote.c || null,
    previousClose: quote.pc || null,
    marketCap: profile.marketCapitalization ? Math.round(profile.marketCapitalization * 1000000) : null,
    currency: profile.currency || "USD",
    exchange: profile.exchange || "US",
    fiftyTwoWeekHigh: metrics["52WeekHigh"] || quote.h || null,
    fiftyTwoWeekLow: metrics["52WeekLow"] || quote.l || null,
    peRatio: metrics.peNormalized || metrics.peTTM || null,
    eps: metrics.epsBasicExclExtraItemsTTM || null,
    sector: profile.finnhubIndustry || "Technology",
    industry: profile.finnhubIndustry || "Software & Services",
    dataSource: "Finnhub"
  };
}

export async function getStockData(company) {
  const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

  // 1. Try Finnhub if API key is provided
  if (FINNHUB_API_KEY) {
    try {
      console.log(`Fetching live stock data for "${company}" using Finnhub...`);
      return await getFinnhubData(company, FINNHUB_API_KEY);
    } catch (error) {
      console.error("Finnhub Error, trying Google Finance fallback:", error.message);
    }
  }

  // 2. Try Google Finance (No Key, works in cloud environments like Render/AWS)
  try {
    console.log(`Fetching live stock data for "${company}" using Google Finance Scraper...`);
    return await getGoogleFinanceData(company);
  } catch (error) {
    console.error("Google Finance Scraper Error, trying Yahoo Finance fallback:", error.message);
  }

  // 3. Try Yahoo Finance (works locally, but usually blocked on cloud environments like Render/AWS)
  try {
    console.log(`Fetching live stock data for "${company}" using Yahoo Finance...`);
    const searchResult = await yahooFinance.search(company);

    if (searchResult.quotes && searchResult.quotes.length > 0) {
      const stock = searchResult.quotes.find(
        (q) => q.symbol && q.quoteType === "EQUITY"
      );

      if (stock) {
        const quote = await yahooFinance.quote(stock.symbol);
        return {
          symbol: quote.symbol,
          companyName: quote.longName,
          currentPrice: quote.regularMarketPrice,
          previousClose: quote.regularMarketPreviousClose,
          marketCap: quote.marketCap,
          currency: quote.currency,
          exchange: quote.fullExchangeName,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
          peRatio: quote.trailingPE,
          eps: quote.epsTrailingTwelveMonths,
          sector: quote.sector,
          industry: quote.industry,
          dataSource: "Yahoo Finance"
        };
      }
    }
    throw new Error("No matching equity symbol found.");
  } catch (error) {
    console.error("Yahoo Finance Error, falling back to simulated data:", error.message);
    
    // 4. Fallback: Generate realistic simulated data to keep app functional in production
    let symbol = "MOCK";
    const normalizedCompany = company.toLowerCase();
    for (const [name, sym] of Object.entries(COMPANY_SYMBOLS)) {
      if (normalizedCompany.includes(name.toLowerCase())) {
        symbol = sym;
        break;
      }
    }
    if (symbol === "MOCK") {
      symbol = company.substring(0, 4).toUpperCase();
    }

    const mockPrice = 120 + Math.random() * 80;
    return {
      symbol: symbol,
      companyName: company.charAt(0).toUpperCase() + company.slice(1) + " Inc. (Simulated)",
      currentPrice: parseFloat(mockPrice.toFixed(2)),
      previousClose: parseFloat((mockPrice * (0.98 + Math.random() * 0.04)).toFixed(2)),
      marketCap: Math.floor(100000000000 + Math.random() * 2000000000000),
      currency: "USD",
      exchange: "NASDAQ",
      fiftyTwoWeekHigh: parseFloat((mockPrice * 1.25).toFixed(2)),
      fiftyTwoWeekLow: parseFloat((mockPrice * 0.85).toFixed(2)),
      peRatio: parseFloat((20 + Math.random() * 15).toFixed(1)),
      eps: parseFloat((2 + Math.random() * 8).toFixed(2)),
      sector: "Technology",
      industry: "Software & Services",
      isSimulated: true,
      dataSource: "Simulated Data Fallback"
    };
  }
}