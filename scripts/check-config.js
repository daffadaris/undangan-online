require('dotenv').config();
const { prisma } = require('./prisma-client');

async function main() {
  console.log('Inspecting WeddingConfig...');
  const configs = await prisma.weddingConfig.findMany({
    include: {
      owner: { select: { username: true, role: true } },
    },
  });

  console.log(`Total WeddingConfigs found: ${configs.length}`);
  configs.forEach((c, idx) => {
    console.log(`\n--- Config #${idx + 1} ---`);
    console.log(`ID: ${c.id}`);
    console.log(`Owner: ${c.owner ? c.owner.username : 'No owner'} (userId: ${c.userId})`);
    console.log(`Groom: ${c.groomNickname} (${c.groomName})`);
    console.log(`Bride: ${c.brideNickname} (${c.brideName})`);
    console.log(`Akad Date: ${c.akadDate} at ${c.akadVenue}`);
    console.log(`Resepsi Date: ${c.resepsiDate} at ${c.resepsiVenue}`);
    console.log(`Theme: ${c.theme}, Design: ${c.design}`);
    console.log(`Show Toggles: Story=${c.showLoveStory}, Gift=${c.showGiftInfo}, RSVP=${c.showRsvp}, Gallery=${c.showGallery}, Akad=${c.showAkad}, Resepsi=${c.showResepsi}, DressCode=${c.showDressCode}`);
    console.log(`QRIS Image: ${c.qrisImage ? 'Available (Length: ' + c.qrisImage.length + ')' : 'None'}`);
    console.log(`Dress Code Title: ${c.dressCodeTitle}`);
    console.log(`Dress Code Colors: ${c.dressCodeColors}`);
    console.log(`Music URL: ${c.musicUrl || 'Default'}`);
    console.log(`Hero Image: ${c.heroImage ? 'Available' : 'None'}`);
    console.log(`Groom Image: ${c.groomImage ? 'Available' : 'None'}`);
    console.log(`Bride Image: ${c.brideImage ? 'Available' : 'None'}`);
    console.log(`Couple Image: ${c.coupleImage ? 'Available' : 'None'}`);
  });
}

main()
  .catch((e) => console.error('Failed to inspect config:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
