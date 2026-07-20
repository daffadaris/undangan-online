const { createClient } = require("@libsql/client");
const fs = require("fs");
require("dotenv").config();

async function backup() {
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const tables = ["Guest", "WeddingConfig"];
  const backup = {};

  for (const t of tables) {
    try {
      const r = await turso.execute("SELECT * FROM " + t);
      backup[t] = r.rows;
      console.log(t + ": " + r.rows.length + " rows backed up");
    } catch (e) {
      console.log(t + ": table not found on Turso");
      backup[t] = [];
    }
  }

  fs.writeFileSync("turso-backup.json", JSON.stringify(backup, null, 2));
  console.log("Backup saved to turso-backup.json");
  turso.close();
}

backup().catch((e) => {
  console.error("Backup failed:", e);
  process.exit(1);
});
