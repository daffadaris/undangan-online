import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

const backupPath = path.join(__dirname, '..', 'turso-backup.json');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

async function restore() {
  const owner = await prisma.user.findUnique({
    where: { username: 'daffa-regina' },
  });

  if (!owner) {
    console.error("Owner 'daffa-regina' not found. Run seed first.");
    process.exit(1);
  }

  console.log(`Restoring data to owner: ${owner.username} (${owner.id})`);

  let imported = 0;
  let skipped = 0;

  for (const g of backup.Guest) {
    try {
      const existing = await prisma.guest.findUnique({
        where: { slug: g.slug },
      });

      if (existing) {
        await prisma.guest.update({
          where: { id: existing.id },
          data: { userId: owner.id },
        });
      } else {
        await prisma.guest.create({
          data: {
            id: g.id,
            name: g.name,
            slug: g.slug,
            phone: g.phone || null,
            group: g.group || null,
            rsvpStatus: g.rsvpStatus || 'pending',
            numberOfGuests: g.numberOfGuests || 1,
            wishes: g.wishes || null,
            wishSentAt: g.wishSentAt ? new Date(g.wishSentAt) : null,
            openedAt: g.openedAt ? new Date(g.openedAt) : null,
            createdAt: new Date(g.createdAt),
            updatedAt: new Date(g.updatedAt),
            userId: owner.id,
          },
        });
      }
      imported++;
    } catch (err: any) {
      console.error(`  Skipped ${g.slug}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nGuests: ${imported} imported, ${skipped} skipped`);

  // Restore wedding config
  if (backup.WeddingConfig && backup.WeddingConfig.length > 0) {
    const cfg = backup.WeddingConfig[0];
    const existingConfig = await prisma.weddingConfig.findUnique({
      where: { userId: owner.id },
    });

    if (existingConfig) {
      await prisma.weddingConfig.update({
        where: { userId: owner.id },
        data: {
          groomName: cfg.groomName || '',
          groomNickname: cfg.groomNickname || '',
          groomParents: cfg.groomParents || '',
          brideName: cfg.brideName || '',
          brideNickname: cfg.brideNickname || '',
          brideParents: cfg.brideParents || '',
          akadDate: cfg.akadDate || '',
          akadTime: cfg.akadTime || '',
          akadVenue: cfg.akadVenue || '',
          akadAddress: cfg.akadAddress || '',
          akadMapsUrl: cfg.akadMapsUrl || '',
          resepsiDate: cfg.resepsiDate || '',
          resepsiTime: cfg.resepsiTime || '',
          resepsiVenue: cfg.resepsiVenue || '',
          resepsiAddress: cfg.resepsiAddress || '',
          resepsiMapsUrl: cfg.resepsiMapsUrl || '',
          loveStory: cfg.loveStory || '[]',
          giftInfo: cfg.giftInfo || '[]',
          heroImage: cfg.heroImage || null,
          groomImage: cfg.groomImage || null,
          brideImage: cfg.brideImage || null,
          coupleImage: cfg.coupleImage || null,
          galleryImages: cfg.galleryImages || '[]',
          musicUrl: cfg.musicUrl || null,
          theme: cfg.theme || 'sage',
          showLoveStory: Boolean(cfg.showLoveStory),
          showGiftInfo: Boolean(cfg.showGiftInfo),
          showRsvp: Boolean(cfg.showRsvp),
          showGallery: Boolean(cfg.showGallery),
          showAkad: Boolean(cfg.showAkad),
          showResepsi: Boolean(cfg.showResepsi),
          akadTitle: cfg.akadTitle || 'Akad Nikah',
          resepsiTitle: cfg.resepsiTitle || 'Resepsi Pernikahan',
          whatsappTemplate: cfg.whatsappTemplate || null,
          groomImagePosition: cfg.groomImagePosition || 'center',
          brideImagePosition: cfg.brideImagePosition || 'center',
          heroImagePosition: cfg.heroImagePosition || 'center',
        },
      });
      console.log('WeddingConfig: updated from backup');
    }
  }

  console.log('\nRestore complete!');
}

restore()
  .catch((e) => {
    console.error('Restore failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
