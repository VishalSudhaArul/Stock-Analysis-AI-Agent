import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_for_stock_ai_agent_2026";

// Permanent File-backed User Backup Cache for high availability
const USER_BACKUP_FILE = path.resolve("data/userBackupCache.json");
const localUsersMap = new Map();

function loadLocalUsersFromDisk() {
  try {
    const dir = path.dirname(USER_BACKUP_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(USER_BACKUP_FILE)) {
      const raw = fs.readFileSync(USER_BACKUP_FILE, "utf-8");
      const data = JSON.parse(raw);
      for (const [key, value] of Object.entries(data)) {
        localUsersMap.set(key, value);
      }
    }
  } catch (err) {
    console.warn("[User Sync Cache Warning] Could not load backup users:", err.message);
  }
}

function saveLocalUsersToDisk() {
  try {
    const dir = path.dirname(USER_BACKUP_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const obj = {};
    for (const [key, value] of localUsersMap.entries()) {
      obj[key] = value;
    }
    fs.writeFileSync(USER_BACKUP_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.warn("[User Sync Cache Warning] Could not save backup users:", err.message);
  }
}

loadLocalUsersFromDisk();

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

    const cleanEmail = email.toLowerCase().trim();

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

    let createdUser = null;

    try {
      // 1. Check if user exists in MongoDB Atlas DB
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists",
          message: "User with this email already exists",
        });
      }

      // 2. Create user directly in MongoDB Atlas DB
      createdUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
        },
      });

      // Create default $100,000 paper trading portfolio for user
      try {
        await prisma.portfolio.create({
          data: {
            userId: createdUser.id,
            name: "Default Portfolio",
            balance: 100000.0,
          },
        });
      } catch (portErr) {
        console.warn("[Auth Warning] Portfolio creation error (non-fatal):", portErr.message);
      }

      console.log(`[Auth Success] User registered permanently in MongoDB Atlas: ${cleanEmail} (${createdUser.id})`);
    } catch (dbErr) {
      console.error("[Auth DB Error] Primary Cloud DB registration query error:", dbErr.message);

      // Check local cache
      if (localUsersMap.has(cleanEmail)) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists",
          message: "User with this email already exists",
        });
      }

      // Fallback if DB string is missing or offline
      const fallbackId = "usr_" + Math.random().toString(36).substring(2, 12);
      createdUser = {
        id: fallbackId,
        email: cleanEmail,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      localUsersMap.set(cleanEmail, createdUser);
      saveLocalUsersToDisk();
    }

    // Always cache user locally for quick recovery
    localUsersMap.set(cleanEmail, {
      id: createdUser.id,
      email: cleanEmail,
      passwordHash,
      createdAt: createdUser.createdAt || new Date().toISOString(),
    });
    saveLocalUsersToDisk();

    // Generate JWT token (valid for 30 days for continuous long-term session)
    const token = jwt.sign(
      { userId: createdUser.id, email: cleanEmail },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: createdUser.id,
        email: cleanEmail,
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

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (dbErr) {
      console.warn("[Auth DB Warning] DB login query failed, checking local persistent backup cache:", dbErr.message);
    }

    // Fall back to local persistent backup cache if DB query returned null or failed
    if (!user) {
      user = localUsersMap.get(cleanEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "No registered account found with this email. Please click 'Create Account' to sign up.",
        message: "No registered account found with this email. Please click 'Create Account' to sign up.",
      });
    }

    // Verify password match
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
        message: "Invalid email or password",
      });
    }

    // If logged in via cache and DB is available, sync back to DB
    if (user && user.id && user.id.startsWith("usr_")) {
      try {
        const dbUserExists = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!dbUserExists) {
          const syncedUser = await prisma.$transaction(async (tx) => {
            const nu = await tx.user.create({
              data: { email: cleanEmail, passwordHash: user.passwordHash },
            });
            await tx.portfolio.create({
              data: { userId: nu.id, name: "Default Portfolio", balance: 100000.0 },
            });
            return nu;
          });
          user = syncedUser;
          localUsersMap.set(cleanEmail, { id: user.id, email: cleanEmail, passwordHash: user.passwordHash });
          saveLocalUsersToDisk();
          console.log(`[Auth Sync] Synced backup user ${cleanEmail} to MongoDB Atlas.`);
        } else {
          user = dbUserExists;
        }
      } catch (syncErr) {
        console.warn("[Auth Sync Warning] Could not sync backup user to DB:", syncErr.message);
      }
    }

    // Generate token (30 days validity)
    const token = jwt.sign(
      { userId: user.id, email: cleanEmail },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: cleanEmail,
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
    const userId = req.user.userId;
    const email = (req.user.email || "").toLowerCase().trim();

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
    } catch (dbErr) {
      console.warn("[Auth DB Warning] Get me DB query failed:", dbErr.message);
    }

    if (!user) {
      const cached = localUsersMap.get(email);
      user = {
        id: cached?.id || userId,
        email: cached?.email || email,
        createdAt: cached?.createdAt || new Date().toISOString(),
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

