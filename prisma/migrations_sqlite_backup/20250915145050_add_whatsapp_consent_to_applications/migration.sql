-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "message" TEXT,
    "whatsapp" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_applications" ("candidateId", "createdAt", "id", "jobId", "message", "status", "updatedAt") SELECT "candidateId", "createdAt", "id", "jobId", "message", "status", "updatedAt" FROM "applications";
DROP TABLE "applications";
ALTER TABLE "new_applications" RENAME TO "applications";
CREATE UNIQUE INDEX "applications_candidateId_jobId_key" ON "applications"("candidateId", "jobId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
