import dotenv from "dotenv";
dotenv.config();

console.log("News API Key:", process.env.NEWS_API_KEY);

import { getCompanyNews } from "./services/newsService.js";

async function test() {
  const news = await getCompanyNews("Apple");
  console.log(news);
}

test();