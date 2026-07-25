// Adds lastOpenedAt + openCount to the Guest table WITHOUT dropping data.
// (Never use db:push-turso for this — that script recreates tables and wipes rows.)
// Applies to both the local dev.db and the remote Turso DB, then backfills any
// existing opens so their count starts at 1 and lastOpenedAt mirrors openedAt.
const path = require("path");
require("dotenv").config();

const ALTERS = [
  `ALTER TABLE "Guest" ADD COLUMN "lastOpenedAt" DATETIME`,
  `ALTER TABLE "Guest" ADD COLUMN "openCount" INTEGER NOT NULL DEFAULT 0`,
];
const BACKFILL = `UPDATE "Guest" SET "openCount" = 1, "lastOpenedAt" = "openedAt" WHERE "openedAt" IS NOT NULL AND "openCount" = 0`;

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
  console.log(`• Turso: backfilled ${res.rowsAffected} existing open(s).`);
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
      console.log(`• Local: applied  ${sql}`);
    } catch (e) {
      if (isDuplicateColErr(e.message)) console.log(`• Local: already exists — ${sql}`);
      else throw e;
    }
  }
  const info = db.prepare(BACKFILL).run();
  console.log(`• Local (${path.basename(dbPath)}): backfilled ${info.changes} existing open(s).`);
  db.close();
}

(async () => {
  alterLocal();
  await alterTurso();
  console.log("✅ Done.");
})().catch((e) => { console.error("❌", e); process.exit(1); });
