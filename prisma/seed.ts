import 'dotenv/config';
import { prisma } from '../src/lib/prisma';



async function main() {
  const config = await prisma.weddingConfig.findUnique({
    where: { id: 'config' },
  });

  if (!config) {
    await prisma.weddingConfig.create({
      data: {
        id: 'config',
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
    console.log('Seed: Wedding config created.');
  }

  const testGuest = await prisma.guest.findUnique({
    where: { slug: 'budi-santoso' },
  });

  if (!testGuest) {
    await prisma.guest.create({
      data: {
        name: 'Budi Santoso',
        slug: 'budi-santoso',
        phone: '08123456789',
        group: 'Teman',
      },
    });
    console.log('Seed: Test guest created.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
