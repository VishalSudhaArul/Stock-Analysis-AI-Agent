import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "saas_ai_investment_secret_key_2026_fallback";

// In-memory fallback storage when cloud DB is unavailable
const memoryUsers = new Map();

export async function signup(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
        message: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let userId = null;

    try {
      // 1. Check if user exists in DB
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists",
          message: "User with this email already exists",
        });
      }

      // 2. Create user and a default portfolio in DB transaction
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
          },
        });

        await tx.portfolio.create({
          data: {
            userId: newUser.id,
            name: "Default Portfolio",
            balance: 100000.0, // $100k starting cash
          },
        });

        return newUser;
      });

      userId = result.id;
    } catch (dbErr) {
      console.warn("[Prisma Database Warning] Cloud DB connection failed, using in-memory session fallback:", dbErr.message);
      
      if (memoryUsers.has(email)) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists",
          message: "User with this email already exists",
        });
      }

      userId = "usr_" + Math.random().toString(36).substring(2, 10);
      memoryUsers.set(email, {
        id: userId,
        email,
        passwordHash,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error during registration",
      message: error.message || "Internal server error during registration",
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
        message: "Email and password are required",
      });
    }

    let user = null;

    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbErr) {
      console.warn("[Prisma Database Warning] DB query failed, checking in-memory store:", dbErr.message);
      user = memoryUsers.get(email);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error during login",
      message: error.message || "Internal server error during login",
    });
  }
}

export async function me(req, res) {
  try {
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
    } catch (dbErr) {
      console.warn("[Prisma Database Warning] Get user me DB failed, serving token user:", dbErr.message);
    }

    if (!user) {
      user = {
        id: req.user.userId,
        email: req.user.email,
        createdAt: new Date().toISOString(),
      };
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User Profile Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error fetching user profile",
      message: error.message || "Internal server error fetching user profile",
    });
  }
}
