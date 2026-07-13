-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT,
    "group" TEXT,
    "rsvpStatus" TEXT NOT NULL DEFAULT 'pending',
    "numberOfGuests" INTEGER NOT NULL DEFAULT 1,
    "wishes" TEXT,
    "wishSentAt" DATETIME,
    "openedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WeddingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'config',
    "groomName" TEXT NOT NULL DEFAULT 'Daffa'' Daris Mahendra Ansori',
    "groomNickname" TEXT NOT NULL DEFAULT 'Daffa',
    "groomParents" TEXT NOT NULL DEFAULT 'Putra dari Bpk. Ansori & Ibu Ansori',
    "brideName" TEXT NOT NULL DEFAULT 'Regina Pingkan Sayyidhina Arif',
    "brideNickname" TEXT NOT NULL DEFAULT 'Regina',
    "brideParents" TEXT NOT NULL DEFAULT 'Putri dari Bpk. Arif & Ibu Arif',
    "akadDate" TEXT NOT NULL DEFAULT '2026-08-08',
    "akadTime" TEXT NOT NULL DEFAULT '08:00 - 10:00 WIB',
    "akadVenue" TEXT NOT NULL DEFAULT 'Masjid Agung',
    "akadAddress" TEXT NOT NULL DEFAULT 'Jl. Raya No. 1',
    "akadMapsUrl" TEXT NOT NULL DEFAULT 'https://maps.google.com',
    "resepsiDate" TEXT NOT NULL DEFAULT '2026-08-08',
    "resepsiTime" TEXT NOT NULL DEFAULT '11:00 - 14:00 WIB',
    "resepsiVenue" TEXT NOT NULL DEFAULT 'Gedung Serbaguna',
    "resepsiAddress" TEXT NOT NULL DEFAULT 'Jl. Raya No. 2',
    "resepsiMapsUrl" TEXT NOT NULL DEFAULT 'https://maps.google.com',
    "loveStory" TEXT NOT NULL DEFAULT '[]',
    "giftInfo" TEXT NOT NULL DEFAULT '[]',
    "heroImage" TEXT,
    "groomImage" TEXT,
    "brideImage" TEXT,
    "coupleImage" TEXT,
    "galleryImages" TEXT NOT NULL DEFAULT '[]',
    "musicUrl" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_slug_key" ON "Guest"("slug");
