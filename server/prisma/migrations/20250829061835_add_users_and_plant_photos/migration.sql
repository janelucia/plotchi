/*
  Warnings:

  - You are about to drop the column `image_url` on the `plants` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `plants` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- Create demo user
INSERT INTO "users" ("id", "email", "name", "updated_at") VALUES 
('demo-user-id', 'demo@plant-tamagotchi.com', 'Demo User', CURRENT_TIMESTAMP);

-- CreateTable
CREATE TABLE "plant_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plant_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plant_photos_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_plants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "species" TEXT,
    "watering_frequency_days" INTEGER NOT NULL,
    "last_watered" DATETIME,
    "notes" TEXT,
    "profile_image_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "plants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Insert existing plants with demo user ID
INSERT INTO "new_plants" ("created_at", "id", "last_watered", "name", "notes", "species", "updated_at", "watering_frequency_days", "user_id") 
SELECT "created_at", "id", "last_watered", "name", "notes", "species", "updated_at", "watering_frequency_days", 'demo-user-id' FROM "plants";
DROP TABLE "plants";
ALTER TABLE "new_plants" RENAME TO "plants";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
