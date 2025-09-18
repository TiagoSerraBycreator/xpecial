/*
  Warnings:

  - Added the required column `slug` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the slug column as nullable
ALTER TABLE "companies" ADD COLUMN "slug" TEXT;

-- Update existing companies with slugs based on their names
UPDATE "companies" SET "slug" = 
  CASE 
    WHEN "name" = 'TechCorp' THEN 'techcorp'
    WHEN "name" = 'InnovaSoft' THEN 'innovasoft'
    ELSE lower(replace(replace(replace(replace(replace("name", ' ', '-'), 'ã', 'a'), 'ç', 'c'), 'é', 'e'), 'ô', 'o'))
  END;

-- Now make the column required and add unique constraint
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "sector" TEXT,
    "description" TEXT,
    "website" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_companies" ("createdAt", "description", "id", "isApproved", "logo", "name", "sector", "slug", "updatedAt", "userId", "website") SELECT "createdAt", "description", "id", "isApproved", "logo", "name", "sector", "slug", "updatedAt", "userId", "website" FROM "companies";
DROP TABLE "companies";
ALTER TABLE "new_companies" RENAME TO "companies";
CREATE UNIQUE INDEX "companies_userId_key" ON "companies"("userId");
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
