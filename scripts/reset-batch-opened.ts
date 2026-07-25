import { prisma } from "../src/lib/prisma";

// Clears openedAt for guests whose "open" is a rapid send-session batch artifact
// (WhatsApp preview crawler), keeping provably-real opens (RSVP/wishes) and
// isolated standalone opens. Pass --apply to write; default is a dry run.
const APPLY = process.argv.includes("--apply");
const CLUSTER_SEC = 90;

async function main() {
  const opened = (
    await prisma.guest.findMany({
      where: { openedAt: { not: null } },
      orderBy: { openedAt: "asc" },
      select: { id: true, name: true, openedAt: true, rsvpStatus: true, wishSentAt: true },
    })
  ).map((g) => ({ ...g, t: new Date(g.openedAt as any).getTime() }));

  const engaged = (g: any) => g.rsvpStatus !== "pending" || !!g.wishSentAt;

  const batch = opened.filter((g, i) => {
    if (engaged(g)) return false; // keep REAL
    const prev = i > 0 ? (g.t - opened[i - 1].t) / 1000 : Infinity;
    const next = i < opened.length - 1 ? (opened[i + 1].t - g.t) / 1000 : Infinity;
    return Math.min(prev, next) <= CLUSTER_SEC; // batch only; isolated is kept
  });

  console.log(`${APPLY ? "APPLYING" : "DRY RUN"} — ${batch.length} batch opens to clear (of ${opened.length} opened):\n`);
  for (const g of batch) console.log(`  ${new Date(g.t).toISOString().slice(0, 19)}  ${g.name}`);

  if (APPLY) {
    const res = await prisma.guest.updateMany({
      where: { id: { in: batch.map((g) => g.id) } },
      data: { openedAt: null },
    });
    console.log(`\nCleared ${res.count} rows.`);
  } else {
    console.log(`\nNothing written. Re-run with --apply to commit.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
