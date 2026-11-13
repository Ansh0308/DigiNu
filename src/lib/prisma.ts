import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Normalize connection string for managed cloud databases (e.g. Aiven)
const rawConnectionString = process.env.DATABASE_URL;
const connectionString = rawConnectionString?.replace("sslmode=require", "sslmode=no-verify");

const isCloudPostgres =
  connectionString?.includes("aivencloud.com") ||
  connectionString?.includes("sslmode=no-verify") ||
  connectionString?.includes("sslmode=require") ||
  process.env.NODE_ENV === "production";

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    ssl: isCloudPostgres ? { rejectUnauthorized: false } : undefined,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
