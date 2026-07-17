import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrismaInstance(): PrismaClient {
  let adapter: any;

  if (process.env.TURSO_DATABASE_URL) {
    const { createClient } = require("@libsql/client");
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    adapter = new PrismaLibSql(libsql);
  } else {
    const Database = require("better-sqlite3");
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const dbPath = (process.env.DATABASE_URL || "file:./dev.db").replace(/^file:/, "");
    const db = new Database(dbPath);
    adapter = new PrismaBetterSqlite3(db);
  }

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || getPrismaInstance();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;



