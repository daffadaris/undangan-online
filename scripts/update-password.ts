import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const username = process.argv[2] || 'admin';
const newPassword = process.argv[3];

if (!newPassword) {
  console.log('Usage: npx tsx scripts/update-password.ts <username> <new-password>');
  console.log('Example: npx tsx scripts/update-password.ts admin mynewpass');
  process.exit(1);
}

async function main() {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    console.error(`User "${username}" not found.`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { username },
    data: { passwordHash: hash },
  });

  console.log(`Password updated for "${username}" -> ${newPassword}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
