import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import investmentRoutes from "./routes/investment.js";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/report.js";
import portfolioRoutes from "./routes/portfolio.js";
import prisma from "./utils/prisma.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/investment", investmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/portfolio", portfolioRoutes);

app.get(["/", "/api/health", "/health"], async (req, res) => {
  let dbStatus = "disconnected";
  try {
    if (prisma && prisma.user) {
      await prisma.user.findFirst();
      dbStatus = "connected (MongoDB Atlas)";
    }
  } catch (err) {
    dbStatus = `warning: ${err.message}`;
  }

  res.json({
    status: "online",
    message: "AI Investment Research Agent API is running 🚀",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});