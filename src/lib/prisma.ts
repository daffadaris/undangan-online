import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrismaInstance(): PrismaClient {
  let adapter: any;

  if (process.env.TURSO_DATABASE_URL) {
    const { PrismaLibSql } = require('@prisma/adapter-libsql/web');
    // Automatically rewrite libsql:// to https:// for fetch-based web adapter compatibility
    let url = process.env.TURSO_DATABASE_URL;
    if (url.startsWith("libsql://")) {
      url = url.replace("libsql://", "https://");
    }
    adapter = new PrismaLibSql({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  } else {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
  }

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || getPrismaInstance();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;



