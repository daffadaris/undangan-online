const { createClient } = require("@libsql/client");
const betterSqlite3 = require("better-sqlite3");
const path = require("path");
require("dotenv").config();

async function run() {
  // Parse Turso envs
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("❌ Error: TURSO_DATABASE_URL is not set in your .env file.");
    process.exit(1);
  }

  console.log("🔌 Connecting to Turso database...");
  const turso = createClient({ url, authToken });

  console.log("📂 Reading local SQLite schema...");
  const fs = require("fs");
  let dbPath = path.join(__dirname, "../dev.db");
  if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
    dbPath = path.join(__dirname, "../prisma/dev.db");
  }
  
  console.log(`   - Using database file at: ${dbPath}`);
  let localDb;
  try {
    localDb = new betterSqlite3(dbPath);
  } catch (err) {
    console.error(`❌ Error opening local database at ${dbPath}. Have you run 'npx prisma db push' locally first?`);
    process.exit(1);
  }

  // Fetch schema definitions
  const tables = localDb.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations'").all();
  const indexes = localDb.prepare("SELECT name, sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL").all();

  console.log(`📊 Found ${tables.length} tables and ${indexes.length} indexes in local database.`);

  console.log("⚠️ Syncing schema to Turso (this will recreate tables on Turso)...");
  
  // Disable foreign keys temporarily for drop actions
  await turso.execute("PRAGMA foreign_keys = OFF");
  
  // Drop old tables
  for (const row of tables) {
    console.log(`   - Dropping table ${row.name} on Turso (if exists)...`);
    await turso.execute(`DROP TABLE IF EXISTS "${row.name}"`);
  }
  
  // Create tables
  for (const row of tables) {
    console.log(`   - Creating table ${row.name}...`);
    await turso.execute(row.sql);
  }

  // Create indexes
  for (const row of indexes) {
    console.log(`   - Creating index ${row.name}...`);
    await turso.execute(row.sql);
  }

  await turso.execute("PRAGMA foreign_keys = ON");
  console.log("✅ Success: Database schema successfully pushed to Turso!");
  
  // Close database connections
  turso.close();
  localDb.close();
}

run().catch((err) => {
  console.error("❌ Sync Error:", err);
  process.exit(1);
});
