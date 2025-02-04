/*
  Warnings:

  - You are about to drop the column `category` on the `budgets` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "category_id" TEXT,
    "is_overall" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_budgets" ("amount", "created_at", "currency", "end_date", "id", "start_date", "title", "updated_at", "user_id") SELECT "amount", "created_at", "currency", "end_date", "id", "start_date", "title", "updated_at", "user_id" FROM "budgets";
DROP TABLE "budgets";
ALTER TABLE "new_budgets" RENAME TO "budgets";
CREATE INDEX "budgets_user_id_idx" ON "budgets"("user_id");
CREATE INDEX "budgets_category_id_idx" ON "budgets"("category_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
