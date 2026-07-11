import YahooFinance from "yahoo-finance2";
import axios from "axios";
import { COMPANY_SYMBOLS } from "../utils/companySymbols.js";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

// Finnhub integration
async function getFinnhubData(company, apiKey) {
  // Step 1: Search symbol
  const searchUrl = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(company)}&token=${apiKey}`;
  const searchRes = await axios.get(searchUrl);
  
  if (!searchRes.data.result || searchRes.data.result.length === 0) {
    throw new Error(`Symbol not found for company: ${company}`);
  }
  
  // Pick the first result that matches (usually the best match)
  const symbol = searchRes.data.result[0].symbol;
  
  // Step 2: Fetch Quote, Profile, and Metrics in parallel
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
      console.error("Finnhub Error, trying Yahoo Finance fallback:", error.message);
    }
  }

  // 2. Try Yahoo Finance (works locally, but usually blocked on cloud environments like Render/AWS)
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
    
    // 3. Fallback: Generate realistic simulated data to keep app functional in production
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