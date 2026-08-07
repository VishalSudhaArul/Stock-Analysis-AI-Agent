import express from "express";
import {
  analyze,
  chat,
  getScreener,
  getMacro,
  postBacktest,
  getInsiderAudit,
} from "../controllers/investmentController.js";

const router = express.Router();

router.post("/analyze", analyze);
router.post("/chat", chat);
router.get("/screener", getScreener);
router.get("/macro", getMacro);
router.post("/backtest", postBacktest);
router.get("/insider-audit", getInsiderAudit);

export default router;