import express from "express";
import {
  getPortfolio,
  executeTrade,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../controllers/portfolioController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All portfolio & paper trading endpoints require authentication
router.get("/", authMiddleware, getPortfolio);
router.post("/trade", authMiddleware, executeTrade);

// Watchlist endpoints
router.get("/watchlist", authMiddleware, getWatchlist);
router.post("/watchlist", authMiddleware, addToWatchlist);
router.delete("/watchlist/:symbol", authMiddleware, removeFromWatchlist);

export default router;

