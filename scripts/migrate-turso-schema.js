require('dotenv').config();
const { prisma } = require('./prisma-client');

async function main() {
  console.log('Migrating Turso schema...');
  const statements = [
    `ALTER TABLE WeddingConfig ADD COLUMN qrisImage TEXT;`,
    `ALTER TABLE WeddingConfig ADD COLUMN showDressCode BOOLEAN DEFAULT 1;`,
    `ALTER TABLE WeddingConfig ADD COLUMN dressCodeTitle TEXT DEFAULT 'Panduan Busana / Dress Code';`,
    `ALTER TABLE WeddingConfig ADD COLUMN dressCodeDescription TEXT DEFAULT 'Baju Kurung / Batik / Busana Formal';`,
    `ALTER TABLE WeddingConfig ADD COLUMN dressCodeColors TEXT DEFAULT '["#A8BBA0", "#FFF8DC", "#C9A96E", "#2F362E"]';`,
  ];

  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`Executed: ${stmt}`);
    } catch (e) {
      if (e.message && e.message.includes('duplicate column name')) {
        console.log(`Column already exists, skipping: ${stmt}`);
      } else {
        console.warn(`Warning executing statement: ${stmt}`, e.message);
      }
    }
  }
  console.log('Turso schema migration complete.');
}

main()
  .catch((e) => console.error('Migration failed:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
