import { getStockData } from "./services/stockService.js";

const data = await getStockData("AAPL");

console.log(data);