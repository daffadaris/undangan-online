// Recompresses images already stored in WeddingConfig (base64 data URLs) the
// same way new uploads are compressed in the browser (src/lib/compressImage.ts):
// long edge ≤ 1600 px (hero/gallery) or 1200 px (portraits), WebP quality 80.
// QRIS is never touched (lossy QR = unscannable). An image is only replaced
// when the result is smaller.
//
//   node scripts/compress-images.js            # dry run: report savings only
//   node scripts/compress-images.js --apply    # write (backs up originals first)
//
// Targets Turso when TURSO_DATABASE_URL is set, otherwise the local dev.db.
// The backup (original values) is written to ./image-backup-<timestamp>.json.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
require("dotenv").config();

const APPLY = process.argv.includes("--apply");
const FIELDS = { heroImage: 1600, groomImage: 1200, brideImage: 1200, coupleImage: 1600 };
const GALLERY_EDGE = 1600;

async function openDb() {
  if (process.env.TURSO_DATABASE_URL) {
    const { createClient } = require("@libsql/client");
    const c = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
    return {
      name: "Turso",
      all: async (sql) => (await c.execute(sql)).rows,
      run: async (sql, args) => c.execute({ sql, args }),
      close: () => c.close(),
    };
  }
  const Database = require("better-sqlite3");
  let dbPath = path.join(__dirname, "../dev.db");
  if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) dbPath = path.join(__dirname, "../prisma/dev.db");
  const db = new Database(dbPath);
  return {
    name: `local ${path.basename(dbPath)}`,
    all: async (sql) => db.prepare(sql).all(),
    run: async (sql, args) => db.prepare(sql).run(...args),
    close: () => db.close(),
  };
}

async function recompress(dataUrl, maxEdge) {
  const m = /^data:([\w.+/-]+);base64,([\s\S]*)$/.exec(dataUrl || "");
  if (!m || !/^image\/(jpe?g|png|webp)$/i.test(m[1])) return null; // skip gif/svg/urls
  const input = Buffer.from(m[2], "base64");
  const output = await sharp(input)
    .rotate() // respect EXIF orientation before it is stripped
    .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  if (output.length >= input.length) return null;
  return { url: `data:image/webp;base64,${output.toString("base64")}`, before: input.length, after: output.length };
}

const kb = (n) => `${Math.round(n / 1024)} KB`;

(async () => {
  const db = await openDb();
  console.log(`${APPLY ? "APPLYING" : "Dry run"} on ${db.name}\n`);
  const rows = await db.all(
    `SELECT id, userId, heroImage, groomImage, brideImage, coupleImage, galleryImages FROM "WeddingConfig"`
  );

  const backup = [];
  const pending = [];
  let totalBefore = 0;
  let totalAfter = 0;

  for (const row of rows) {
    const updates = {};
    for (const [field, edge] of Object.entries(FIELDS)) {
      const r = await recompress(row[field], edge);
      if (!r) continue;
      updates[field] = r.url;
      totalBefore += r.before;
      totalAfter += r.after;
      console.log(`  ${row.userId} ${field}: ${kb(r.before)} → ${kb(r.after)}`);
    }

    let gallery = [];
    try { gallery = JSON.parse(row.galleryImages || "[]"); } catch {}
    let galleryChanged = false;
    for (let i = 0; i < gallery.length; i++) {
      const r = await recompress(gallery[i], GALLERY_EDGE);
      if (!r) continue;
      gallery[i] = r.url;
      galleryChanged = true;
      totalBefore += r.before;
      totalAfter += r.after;
      console.log(`  ${row.userId} gallery[${i}]: ${kb(r.before)} → ${kb(r.after)}`);
    }
    if (galleryChanged) updates.galleryImages = JSON.stringify(gallery);

    if (Object.keys(updates).length === 0) continue;
    backup.push({ id: row.id, userId: row.userId, original: Object.fromEntries(Object.keys(updates).map((k) => [k, row[k]])) });
    pending.push({ id: row.id, updates });
  }

  console.log(`\nImages: ${kb(totalBefore)} → ${kb(totalAfter)} (${totalBefore ? Math.round((1 - totalAfter / totalBefore) * 100) : 0}% smaller)`);
  if (APPLY && pending.length) {
    // Back up before writing anything, so a failure midway loses nothing.
    const file = path.join(process.cwd(), `image-backup-${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(backup));
    console.log(`Originals backed up to ${file}`);
    for (const { id, updates } of pending) {
      const cols = Object.keys(updates);
      await db.run(
        `UPDATE "WeddingConfig" SET ${cols.map((c) => `"${c}" = ?`).join(", ")} WHERE id = ?`,
        [...cols.map((c) => updates[c]), id]
      );
    }
    console.log(`Updated ${pending.length} wedding config(s).`);
  } else if (!APPLY) {
    console.log("Nothing written. Re-run with --apply to save.");
  }
  db.close();
})().catch((e) => { console.error("❌", e); process.exit(1); });
