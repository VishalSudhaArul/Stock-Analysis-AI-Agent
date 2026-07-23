import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";

let prismaInstance = null;

const dbUrl = process.env.DATABASE_URL;

const isValidDb = dbUrl && (
  dbUrl.startsWith("mongodb://") ||
  dbUrl.startsWith("mongodb+srv://") ||
  dbUrl.startsWith("postgres://") ||
  dbUrl.startsWith("postgresql://")
);

if (isValidDb) {
  try {
    prismaInstance = new PrismaClient();
    console.log("[Database Info] Successfully initialized Prisma Client for MongoDB Atlas / Cloud DB");
  } catch (err) {
    console.warn("[Prisma Init Warning] Failed to initialize PrismaClient:", err.message);
  }
} else {
  console.log("[Database Info] Operating in resilient In-Memory session mode.");
}

// Proxy handler to catch any DB operations when Prisma is not configured
const fallbackProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === "$transaction") {
      return async () => {
        throw new Error("Cloud database connection string (DATABASE_URL) is not configured.");
      };
    }
    return new Proxy({}, {
      get() {
        return async () => {
          throw new Error("Cloud database connection string (DATABASE_URL) is not configured.");
        };
      }
    });
  }
});

const prisma = prismaInstance || fallbackProxy;

export default prisma;
