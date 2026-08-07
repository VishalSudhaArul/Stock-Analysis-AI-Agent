import express from "express";
import { analyze, chat, getScreener } from "../controllers/investmentController.js";

const router = express.Router();

router.post("/analyze", analyze);
router.post("/chat", chat);
router.get("/screener", getScreener);

export default router;