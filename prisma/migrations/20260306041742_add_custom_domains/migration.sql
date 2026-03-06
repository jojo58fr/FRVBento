-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verificationToken" TEXT NOT NULL,
    "bentoId" TEXT NOT NULL,
    "ownerId" TEXT,
    "verifiedAt" DATETIME,
    "lastCheckedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomDomain_bentoId_fkey" FOREIGN KEY ("bentoId") REFERENCES "Bento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CustomDomain_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_domain_key" ON "CustomDomain"("domain");
