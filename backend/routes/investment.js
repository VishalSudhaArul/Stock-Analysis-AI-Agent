import express from "express";
import { analyze, chat } from "../controllers/investmentController.js";

const router = express.Router();

router.post("/analyze", analyze);
router.post("/chat", chat);

export default router;