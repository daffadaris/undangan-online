import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // ── Create Super Admin ──
  const superUsername = process.env.SUPER_ADMIN_USERNAME || 'admin';
  const superPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';

  let superAdmin = await prisma.user.findUnique({
    where: { username: superUsername },
  });

  if (!superAdmin) {
    const hash = await bcrypt.hash(superPassword, 10);
    superAdmin = await prisma.user.create({
      data: {
        username: superUsername,
        passwordHash: hash,
        role: 'super_admin',
      },
    });
    console.log(`Seed: Super admin "${superUsername}" created.`);
  } else {
    console.log(`Seed: Super admin "${superUsername}" already exists.`);
  }

  // ── Create First Owner (Daffa & Regina) ──
  const ownerUsername = 'daffa-regina';
  const ownerPassword = process.env.OWNER_PASSWORD || 'daffaregina123';

  let owner = await prisma.user.findUnique({
    where: { username: ownerUsername },
  });

  if (!owner) {
    const hash = await bcrypt.hash(ownerPassword, 10);
    owner = await prisma.user.create({
      data: {
        username: ownerUsername,
        passwordHash: hash,
        role: 'owner',
      },
    });
    console.log(`Seed: Owner "${ownerUsername}" created.`);
  } else {
    console.log(`Seed: Owner "${ownerUsername}" already exists.`);
  }

  // ── Migrate existing WeddingConfig to owner ──
  const existingConfig = await prisma.weddingConfig.findFirst({
    where: { userId: null },
  });

  if (existingConfig) {
    await prisma.weddingConfig.update({
      where: { id: existingConfig.id },
      data: { userId: owner.id },
    });
    console.log('Seed: Existing WeddingConfig linked to owner.');
  } else {
    // Check if owner already has a config
    const ownerConfig = await prisma.weddingConfig.findUnique({
      where: { userId: owner.id },
    });

    if (!ownerConfig) {
      await prisma.weddingConfig.create({
        data: {
          userId: owner.id,
          groomName: "Daffa' Daris Mahendra Ansori",
          groomNickname: 'Daffa',
          groomParents: 'Putra Pertama dari Bpk. Ansori & Ibu Ansori',
          brideName: 'Regina Pingkan Sayyidhina Arif',
          brideNickname: 'Regina',
          brideParents: 'Putri Kedua dari Bpk. Arif & Ibu Arif',
          akadDate: '2026-08-08',
          akadTime: '08:00 - 10:00 WIB',
          akadVenue: 'Masjid Agung Al-Hikmah',
          akadAddress: 'Jl. Pemuda No. 12, Jakarta',
          akadMapsUrl: 'https://maps.app.goo.gl/xxxx',
          resepsiDate: '2026-08-08',
          resepsiTime: '11:00 - 14:00 WIB',
          resepsiVenue: 'Gedung Pertemuan Sasana Kriya',
          resepsiAddress: 'Jl. Indah No. 34, Jakarta',
          resepsiMapsUrl: 'https://maps.app.goo.gl/yyyy',
          loveStory: JSON.stringify([
            {
              year: '2020',
              title: 'Pertama Bertemu',
              description: 'Kami pertama kali bertemu di kampus saat orientasi mahasiswa baru.',
            },
            {
              year: '2022',
              title: 'Mulai Menjalin Hubungan',
              description: 'Setelah berteman dekat, kami memutuskan untuk berkomitmen satu sama lain.',
            },
            {
              year: '2025',
              title: 'Lamaran',
              description: 'Daffa melamar Regina dengan dihadiri oleh keluarga dekat kedua belah pihak.',
            }
          ]),
          giftInfo: JSON.stringify([
            {
              bankName: 'Bank BCA',
              accountName: "Daffa' Daris M A",
              accountNumber: '1234567890',
            },
            {
              bankName: 'Bank Mandiri',
              accountName: 'Regina Pingkan S A',
              accountNumber: '0987654321',
            }
          ]),
          galleryImages: JSON.stringify([]),
        },
      });
      console.log('Seed: WeddingConfig created for owner.');
    }
  }

  // ── Link existing guests to owner ──
  const unlinkedGuests = await prisma.guest.updateMany({
    where: { userId: null },
    data: { userId: owner.id },
  });
  if (unlinkedGuests.count > 0) {
    console.log(`Seed: ${unlinkedGuests.count} existing guests linked to owner.`);
  }

  // ── Create test guest if none ──
  const testGuest = await prisma.guest.findFirst({
    where: { slug: 'budi-santoso', userId: owner.id },
  });

  if (!testGuest) {
    await prisma.guest.create({
      data: {
        name: 'Budi Santoso',
        slug: 'budi-santoso',
        phone: '08123456789',
        group: 'Teman',
        userId: owner.id,
      },
    });
    console.log('Seed: Test guest created.');
  }

  console.log('Seed complete!');
  console.log(`  Super admin: ${superUsername} / ${superPassword}`);
  console.log(`  Owner:       ${ownerUsername} / ${ownerPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
