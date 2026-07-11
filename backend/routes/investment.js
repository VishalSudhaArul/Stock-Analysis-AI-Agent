import express from "express";
import { analyze } from "../controllers/investmentController.js";

const router = express.Router();

router.post("/analyze", analyze);

export default router;