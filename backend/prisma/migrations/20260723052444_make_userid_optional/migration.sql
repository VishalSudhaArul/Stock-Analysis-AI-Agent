-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "symbol" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "analysisData" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavedReport" ("analysisData", "companyName", "createdAt", "id", "shareId", "symbol", "userId") SELECT "analysisData", "companyName", "createdAt", "id", "shareId", "symbol", "userId" FROM "SavedReport";
DROP TABLE "SavedReport";
ALTER TABLE "new_SavedReport" RENAME TO "SavedReport";
CREATE UNIQUE INDEX "SavedReport_shareId_key" ON "SavedReport"("shareId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
