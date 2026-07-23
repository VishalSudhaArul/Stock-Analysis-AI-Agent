import prisma from "../utils/prisma.js";
import crypto from "crypto";
import { getStockData } from "../services/stockService.js";

export async function saveReport(req, res) {
  try {
    const { symbol, companyName, analysisData } = req.body;
    const userId = req.user.userId;

    if (!symbol || !companyName || !analysisData) {
      return res.status(400).json({
        success: false,
        message: "Symbol, Company Name, and Analysis Data are required",
      });
    }

    // Generate a unique share identifier
    const shareId = crypto.randomBytes(8).toString("hex");

    const savedReport = await prisma.savedReport.create({
      data: {
        userId,
        symbol,
        companyName,
        analysisData: typeof analysisData === "string" ? analysisData : JSON.stringify(analysisData),
        shareId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Report saved successfully",
      data: {
        id: savedReport.id,
        symbol: savedReport.symbol,
        companyName: savedReport.companyName,
        shareId: savedReport.shareId,
        createdAt: savedReport.createdAt,
      },
    });
  } catch (error) {
    console.error("Save Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save the report",
      error: error.message,
    });
  }
}

export async function getUserReports(req, res) {
  try {
    const userId = req.user.userId;

    const reports = await prisma.savedReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        symbol: true,
        companyName: true,
        shareId: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Get User Reports Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved reports",
      error: error.message,
    });
  }
}

export async function getPublicReport(req, res) {
  try {
    const { shareId } = req.params;

    const report = await prisma.savedReport.findUnique({
      where: { shareId },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or link has expired",
      });
    }

    const parsedAnalysis = JSON.parse(report.analysisData);

    // Fetch fresh live market data for the shared ticker (e.g. current stock price)
    let freshStockData = null;
    try {
      freshStockData = await getStockData(report.symbol);
    } catch (stockErr) {
      console.warn(`Could not fetch fresh stock data for public report: ${report.symbol}`, stockErr.message);
    }

    return res.json({
      success: true,
      data: {
        symbol: report.symbol,
        companyName: report.companyName,
        createdAt: report.createdAt,
        analysis: parsedAnalysis.analysis,
        marketAnalysis: parsedAnalysis.marketAnalysis,
        sentimentAnalysis: parsedAnalysis.sentimentAnalysis,
        currentMarketData: freshStockData, // Real-time price overlay on top of saved AI report
      },
    });
  } catch (error) {
    console.error("Get Public Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load public report",
      error: error.message,
    });
  }
}
