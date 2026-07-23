import express from "express";
import { saveReport, getUserReports, getPublicReport } from "../controllers/reportController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Authenticated report operations
router.post("/save", authMiddleware, saveReport);
router.get("/user", authMiddleware, getUserReports);

// Public unauthenticated viewing of shared reports
router.get("/public/:shareId", getPublicReport);

export default router;
