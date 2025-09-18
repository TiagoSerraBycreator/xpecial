/*
  Warnings:

  - Added the required column `email` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logo" TEXT,
    "sector" TEXT,
    "description" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "foundedYear" TEXT,
    "employeeCount" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "values" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_companies" ("address", "city", "createdAt", "description", "employeeCount", "foundedYear", "id", "isApproved", "logo", "mission", "name", "phone", "sector", "slug", "state", "updatedAt", "userId", "values", "vision", "website") SELECT "address", "city", "createdAt", "description", "employeeCount", "foundedYear", "id", "isApproved", "logo", "mission", "name", "phone", "sector", "slug", "state", "updatedAt", "userId", "values", "vision", "website" FROM "companies";
DROP TABLE "companies";
ALTER TABLE "new_companies" RENAME TO "companies";
CREATE UNIQUE INDEX "companies_userId_key" ON "companies"("userId");
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
