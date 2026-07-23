import express from "express";
import { getPortfolio, executeTrade } from "../controllers/portfolioController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All portfolio endpoints require authentication
router.get("/", authMiddleware, getPortfolio);
router.post("/trade", authMiddleware, executeTrade);

export default router;
