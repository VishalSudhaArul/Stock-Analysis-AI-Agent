import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function getCompanyNews(company) {
  try {
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
      }
    );

    return response.data.articles.map((article) => ({
      title: article.title,
      source: article.source.name,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
    }));
  } catch (err) {
    console.error("News API Error:", err.response?.data || err.message);
    return [];
  }
}