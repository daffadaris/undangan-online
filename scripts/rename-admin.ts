import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.user.update({
    where: { username: 'admin' },
    data: { username: 'admindaffa' },
  });
  console.log('Username changed: admin -> admindaffa');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
