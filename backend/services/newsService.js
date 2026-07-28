import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Fallback Google News RSS Parser
async function getGoogleNewsRss(company) {
  try {
    console.log(`[News Fallback] Fetching Google News RSS feed for "${company}"...`);
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(company)}+stock+finance&hl=en-US&gl=US&ceid=US:en`;
    const res = await axios.get(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 5000,
    });

    const xml = res.data;
    const itemRegex = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<source[^>]*>([\s\S]*?)<\/source>[\s\S]*?<\/item>/g;

    const articles = [];
    let match;
    while ((match = itemRegex.exec(xml)) !== null && articles.length < 5) {
      const rawTitle = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
      const url = match[2].trim();
      const publishedAt = match[3].trim();
      const rawSource = match[4].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() || "Financial News";

      articles.push({
        title: rawTitle,
        source: rawSource,
        description: `${rawTitle} — Reported by ${rawSource}`,
        url: url,
        publishedAt: publishedAt,
      });
    }

    return articles;
  } catch (rssErr) {
    console.error("Google News RSS Error:", rssErr.message);
    return [];
  }
}

export async function getCompanyNews(company) {
  let articles = [];

  // 1. Try NewsAPI if API Key is configured
  if (NEWS_API_KEY) {
    try {
      console.log(`Fetching news for "${company}" via NewsAPI...`);
      const response = await axios.get(
        "https://newsapi.org/v2/everything",
        {
          params: {
            q: company,
            language: "en",
            sortBy: "publishedAt",
            pageSize: 5,
            apiKey: NEWS_API_KEY,
          },
          timeout: 5000,
        }
      );

      if (response.data && response.data.articles && response.data.articles.length > 0) {
        articles = response.data.articles.map((article) => ({
          title: article.title,
          source: article.source.name,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
        }));
      }
    } catch (err) {
      console.warn("News API Error, switching to Google News RSS fallback:", err.response?.data?.message || err.message);
    }
  }

  // 2. Fallback to Google News RSS Feed if NewsAPI returned 0 articles or failed
  if (articles.length === 0) {
    articles = await getGoogleNewsRss(company);
  }

  return articles;
}