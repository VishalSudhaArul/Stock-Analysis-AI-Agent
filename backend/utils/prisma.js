import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";

let prismaInstance = null;

const dbUrl = process.env.DATABASE_URL;

// Only instantiate Prisma if DATABASE_URL is a valid PostgreSQL connection string
if (dbUrl && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
  try {
    prismaInstance = new PrismaClient();
  } catch (err) {
    console.warn("[Prisma Init Warning] Failed to initialize PrismaClient:", err.message);
  }
} else {
  console.log("[Database Info] No valid cloud PostgreSQL DATABASE_URL found. Operating in resilient In-Memory session mode.");
}

// Proxy handler to catch any DB operations when Prisma is not configured
const fallbackProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === "$transaction") {
      return async () => {
        throw new Error("Cloud PostgreSQL database connection string (DATABASE_URL) is not configured.");
      };
    }
    return new Proxy({}, {
      get() {
        return async () => {
          throw new Error("Cloud PostgreSQL database connection string (DATABASE_URL) is not configured.");
        };
      }
    });
  }
});

const prisma = prismaInstance || fallbackProxy;

export default prisma;
