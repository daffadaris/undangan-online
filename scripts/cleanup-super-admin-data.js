// Deletes any Guest/WeddingConfig rows accidentally owned by a super_admin account.
// Super admins should never own invitation data — they manage owners and view read-only.
// Run scripts/backup-before-migration.js first if you want a restorable snapshot.
// Usage: node scripts/cleanup-super-admin-data.js [--confirm]
require('dotenv').config();
const { prisma } = require('./prisma-client');

async function main() {
  const confirm = process.argv.includes('--confirm');

  const superAdmins = await prisma.user.findMany({
    where: { role: 'super_admin' },
    select: { id: true, username: true },
  });

  if (superAdmins.length === 0) {
    console.log('No super_admin accounts found.');
    return;
  }

  const superAdminIds = superAdmins.map((u) => u.id);

  const guests = await prisma.guest.findMany({
    where: { userId: { in: superAdminIds } },
    select: { id: true, name: true, userId: true },
  });
  const configs = await prisma.weddingConfig.findMany({
    where: { userId: { in: superAdminIds } },
    select: { id: true, userId: true },
  });

  console.log(`Super admin accounts: ${superAdmins.map((u) => u.username).join(', ')}`);
  console.log(`Found ${guests.length} guest row(s) and ${configs.length} WeddingConfig row(s) owned by super_admin.`);

  if (guests.length === 0 && configs.length === 0) {
    console.log('Nothing to clean up.');
    return;
  }

  if (!confirm) {
    console.log('\nDry run only. Re-run with --confirm to delete the rows listed above.');
    return;
  }

  const deletedGuests = await prisma.guest.deleteMany({ where: { userId: { in: superAdminIds } } });
  const deletedConfigs = await prisma.weddingConfig.deleteMany({ where: { userId: { in: superAdminIds } } });

  console.log(`Deleted ${deletedGuests.count} guest row(s) and ${deletedConfigs.count} WeddingConfig row(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
