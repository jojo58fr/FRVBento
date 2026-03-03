/*
  Warnings:

  - You are about to drop the `BentoRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BentoRecord";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Bento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PublishedBento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "bentoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PublishedBento_bentoId_fkey" FOREIGN KEY ("bentoId") REFERENCES "Bento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PublishedBento_slug_key" ON "PublishedBento"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PublishedBento_bentoId_key" ON "PublishedBento"("bentoId");
