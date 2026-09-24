// Adds the "Check-in QR" columns (Guest.checkinCode, Guest.checkedInAt,
// Guest.checkedInCount, WeddingConfig.qrCheckin) WITHOUT dropping data, then
// gives every existing guest a unique 8-char check-in code.
// (Never use db:push-turso for this — that script recreates tables and wipes rows.)
// Applies to both the local dev.db and the remote Turso DB. Safe to re-run.
const path = require("path");
require("dotenv").config();

const ALTERS = [
  `ALTER TABLE "Guest" ADD COLUMN "checkinCode" TEXT`,
  `ALTER TABLE "Guest" ADD COLUMN "checkedInAt" DATETIME`,
  `ALTER TABLE "Guest" ADD COLUMN "checkedInCount" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "WeddingConfig" ADD COLUMN "qrCheckin" BOOLEAN NOT NULL DEFAULT false`,
];
// Same format as newCheckinCode() in src/lib/utils.ts; randomblob() is evaluated per row.
const BACKFILL = `UPDATE "Guest" SET "checkinCode" = upper(hex(randomblob(4))) WHERE "checkinCode" IS NULL`;
// The index Prisma expects for `checkinCode String? @unique`.
const INDEX = `CREATE UNIQUE INDEX IF NOT EXISTS "Guest_checkinCode_key" ON "Guest"("checkinCode")`;

function isDuplicateColErr(msg) {
  return /duplicate column name/i.test(msg || "");
}

async function alterTurso() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return console.log("• Turso: TURSO_DATABASE_URL not set, skipping.");
  const { createClient } = require("@libsql/client");
  const turso = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  for (const sql of ALTERS) {
    try {
      await turso.execute(sql);
      console.log(`• Turso: applied  ${sql}`);
    } catch (e) {
      if (isDuplicateColErr(e.message)) console.log(`• Turso: already exists — ${sql}`);
      else throw e;
    }
  }
  const res = await turso.execute(BACKFILL);
  console.log(`• Turso: gave ${res.rowsAffected} guest(s) a check-in code.`);
  await turso.execute(INDEX);
  console.log("• Turso: unique index on checkinCode ready.");
  turso.close();
}

function alterLocal() {
  const fs = require("fs");
  const betterSqlite3 = require("better-sqlite3");
  let dbPath = path.join(__dirname, "../dev.db");
  if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) dbPath = path.join(__dirname, "../prisma/dev.db");
  const db = new betterSqlite3(dbPath);
  for (const sql of ALTERS) {
    try {
      db.prepare(sql).run();
      console.log(`• Local (${path.basename(dbPath)}): applied  ${sql}`);
    } catch (e) {
      if (isDuplicateColErr(e.message)) console.log(`• Local: already exists — ${sql}`);
      else throw e;
    }
  }
  const info = db.prepare(BACKFILL).run();
  console.log(`• Local: gave ${info.changes} guest(s) a check-in code.`);
  db.prepare(INDEX).run();
  console.log("• Local: unique index on checkinCode ready.");
  db.close();
}

(async () => {
  alterLocal();
  await alterTurso();
  console.log("✅ Done.");
})().catch((e) => { console.error("❌", e); process.exit(1); });
