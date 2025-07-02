-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileImage" TEXT,
    "bio" TEXT,
    "preferences" TEXT NOT NULL DEFAULT '{}',
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "dailyCalories" INTEGER NOT NULL DEFAULT 0,
    "dailyCalorieGoal" INTEGER NOT NULL DEFAULT 2000,
    "age" INTEGER,
    "gender" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "fcmTokens" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("age", "bio", "createdAt", "dailyCalories", "email", "fcmTokens", "gender", "height", "id", "password", "preferences", "profileImage", "totalPoints", "updatedAt", "username", "weight") SELECT "age", "bio", "createdAt", "dailyCalories", "email", "fcmTokens", "gender", "height", "id", "password", "preferences", "profileImage", "totalPoints", "updatedAt", "username", "weight" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
