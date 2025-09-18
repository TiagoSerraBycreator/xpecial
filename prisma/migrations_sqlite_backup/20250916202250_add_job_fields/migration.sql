-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "responsibilities" TEXT,
    "benefits" TEXT,
    "location" TEXT,
    "workMode" TEXT NOT NULL DEFAULT 'PRESENCIAL',
    "type" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "level" TEXT NOT NULL DEFAULT 'PLENO',
    "salaryMin" REAL,
    "salaryMax" REAL,
    "city" TEXT,
    "state" TEXT,
    "sector" TEXT,
    "skills" TEXT,
    "experienceYears" INTEGER,
    "education" TEXT,
    "languages" TEXT,
    "recruitmentVideoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_jobs" ("city", "companyId", "createdAt", "description", "id", "isActive", "location", "recruitmentVideoUrl", "requirements", "salaryMax", "salaryMin", "sector", "state", "status", "title", "updatedAt", "workMode") SELECT "city", "companyId", "createdAt", "description", "id", "isActive", "location", "recruitmentVideoUrl", "requirements", "salaryMax", "salaryMin", "sector", "state", "status", "title", "updatedAt", "workMode" FROM "jobs";
DROP TABLE "jobs";
ALTER TABLE "new_jobs" RENAME TO "jobs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
