// Restore Turso backup JSON data into the daffa-regina owner user
// Usage: node scripts/restore-backup.js
require('dotenv').config();
const { prisma } = require('./prisma-client');
const fs = require('fs');

async function main() {
  const backupPath = 'turso-backup.json';
  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found: ${backupPath}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

  // Find or create the daffa-regina owner
  const ownerUsername = 'daffa-regina';
  let owner = await prisma.user.findUnique({ where: { username: ownerUsername } });

  if (!owner) {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(process.env.OWNER_PASSWORD || 'daffaregina123', 10);
    owner = await prisma.user.create({
      data: {
        username: ownerUsername,
        passwordHash: hash,
        role: 'owner',
      },
    });
    console.log(`Created owner: ${ownerUsername}`);
  } else {
    console.log(`Owner already exists: ${ownerUsername}`);
  }

  // Restore WeddingConfig
  const configRaw = raw.configs;
  if (configRaw && configRaw.length > 0) {
    const c = configRaw[0];
    const existingConfig = await prisma.weddingConfig.findUnique({ where: { userId: owner.id } });
    if (!existingConfig) {
      await prisma.weddingConfig.create({
        data: {
          userId: owner.id,
          groomName: c.groomName || "Daffa' Daris Mahendra Ansori",
          groomNickname: c.groomNickname || 'Daffa',
          groomParents: c.groomParents || '',
          brideName: c.brideName || 'Regina Pingkan Sayyidhina Arif',
          brideNickname: c.brideNickname || 'Regina',
          brideParents: c.brideParents || '',
          akadDate: c.akadDate || '2026-08-08',
          akadTime: c.akadTime || '',
          akadVenue: c.akadVenue || '',
          akadAddress: c.akadAddress || '',
          akadMapsUrl: c.akadMapsUrl || '',
          resepsiDate: c.resepsiDate || '2026-08-08',
          resepsiTime: c.resepsiTime || '',
          resepsiVenue: c.resepsiVenue || '',
          resepsiAddress: c.resepsiAddress || '',
          resepsiMapsUrl: c.resepsiMapsUrl || '',
          loveStory: c.loveStory || '[]',
          giftInfo: c.giftInfo || '[]',
          heroImage: c.heroImage || null,
          groomImage: c.groomImage || null,
          brideImage: c.brideImage || null,
          coupleImage: c.coupleImage || null,
          galleryImages: c.galleryImages || '[]',
          musicUrl: c.musicUrl || null,
          theme: c.theme || 'sage',
          showLoveStory: c.showLoveStory !== false,
          showGiftInfo: c.showGiftInfo !== false,
          showRsvp: c.showRsvp !== false,
          showGallery: c.showGallery !== false,
          showAkad: c.showAkad !== false,
          showResepsi: c.showResepsi !== false,
          akadTitle: c.akadTitle || 'Akad Nikah',
          resepsiTitle: c.resepsiTitle || 'Resepsi Pernikahan',
          whatsappTemplate: c.whatsappTemplate || null,
          groomImagePosition: c.groomImagePosition || 'center',
          brideImagePosition: c.brideImagePosition || 'center',
          heroImagePosition: c.heroImagePosition || 'center',
        },
      });
      console.log('WeddingConfig restored.');
    } else {
      console.log('WeddingConfig already exists for owner, skipping.');
    }
  }

  // Restore Guests
  const guests = raw.guests;
  if (!guests || guests.length === 0) {
    console.log('No guests to restore.');
    return;
  }

  let imported = 0;
  let skipped = 0;

  for (const g of guests) {
    // Skip if slug already exists
    const existing = await prisma.guest.findUnique({ where: { slug: g.slug } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.guest.create({
      data: {
        name: g.name,
        slug: g.slug,
        phone: g.phone || null,
        group: g.group || null,
        rsvpStatus: g.rsvpStatus || 'pending',
        numberOfGuests: g.numberOfGuests || 1,
        wishes: g.wishes || null,
        wishSentAt: g.wishSentAt ? new Date(g.wishSentAt) : null,
        openedAt: g.openedAt ? new Date(g.openedAt) : null,
        createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
        updatedAt: g.updatedAt ? new Date(g.updatedAt) : new Date(),
        userId: owner.id,
      },
    });
    imported++;
  }

  console.log(`Restored ${imported} guests (${skipped} skipped as duplicates).`);
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
