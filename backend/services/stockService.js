import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

export async function getStockData(company) {
  try {
    // Step 1: Search company
    const searchResult = await yahooFinance.search(company);

    if (
      !searchResult.quotes ||
      searchResult.quotes.length === 0
    ) {
      throw new Error("Company not found.");
    }

    // Step 2: Pick the first stock result
    const stock = searchResult.quotes.find(
      (q) => q.symbol && q.quoteType === "EQUITY"
    );

    if (!stock) {
      throw new Error("No stock symbol found.");
    }

    // Step 3: Fetch live quote
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
    };
  } catch (error) {
    console.error("Yahoo Finance Error:", error);
    throw new Error("Unable to fetch stock data.");
  }
}