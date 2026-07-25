import { prisma } from "../src/lib/prisma";

async function main() {
  const guests = await prisma.guest.findMany({
    orderBy: { openedAt: "asc" },
    select: { name: true, openedAt: true, rsvpStatus: true, wishSentAt: true, createdAt: true },
  });

  const opened = guests
    .filter((g) => g.openedAt)
    .map((g) => ({ ...g, t: new Date(g.openedAt as any).getTime() }));

  const iso = (ms: number) => new Date(ms).toISOString().replace("T", " ").slice(0, 19);
  const engagedOf = (g: any) => g.rsvpStatus !== "pending" || !!g.wishSentAt;

  // Nearest-neighbour gap: smallest distance to any other open. Small = part of a
  // rapid send-session batch (crawler); large = a standalone open.
  const CLUSTER_SEC = 90;
  console.log(`Opened: ${opened.length} of ${guests.length}\n`);
  console.log("timestamp           | nearGap | tier      | rsvp      | wishes | name");

  for (let i = 0; i < opened.length; i++) {
    const g = opened[i];
    const prev = i > 0 ? (g.t - opened[i - 1].t) / 1000 : Infinity;
    const next = i < opened.length - 1 ? (opened[i + 1].t - g.t) / 1000 : Infinity;
    const near = Math.min(prev, next);
    const tier = engagedOf(g)
      ? "REAL      "
      : near <= CLUSTER_SEC
      ? "batch     "
      : "ISOLATED  ";
    const gapStr = near === Infinity ? "  --  " : `${Math.round(near)}s`.padStart(6);
    console.log(
      `${iso(g.t)} | ${gapStr} | ${tier}| ${g.rsvpStatus.padEnd(9)} | ${g.wishSentAt ? "yes" : "no "}    | ${g.name}`
    );
  }

  const real = opened.filter(engagedOf);
  const isolated = opened.filter((g) => {
    const idx = opened.indexOf(g);
    const prev = idx > 0 ? (g.t - opened[idx - 1].t) / 1000 : Infinity;
    const next = idx < opened.length - 1 ? (opened[idx + 1].t - g.t) / 1000 : Infinity;
    return !engagedOf(g) && Math.min(prev, next) > CLUSTER_SEC;
  });
  const batch = opened.length - real.length - isolated.length;
  console.log(`\nSummary: ${real.length} REAL, ${isolated.length} ISOLATED (standalone, ambiguous), ${batch} batch (crawler send-session)`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
