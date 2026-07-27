// Quick backup of Turso data before schema sync
// Usage: node scripts/backup-before-migration.js
require('dotenv').config();
const { prisma } = require('./prisma-client');
const fs = require('fs');

async function main() {
  try {
    const guests = await prisma.guest.findMany();
    const configs = await prisma.weddingConfig.findMany();
    const users = await prisma.user.findMany();
    
    const backup = {
      exportedAt: new Date().toISOString(),
      guests,
      configs,
      users,
    };
    
    fs.writeFileSync('turso-backup.json', JSON.stringify(backup, null, 2));
    console.log(`Backed up ${guests.length} guests, ${configs.length} configs, ${users.length} users → turso-backup.json`);
  } catch (e) {
    console.error('Backup failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
