/*
  Warnings:

  - Changed the type of `prayer_name` on the `daily_prayer_schedules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `prayer_name` on the `prayer_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `prayer_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PrayerName" AS ENUM ('subuh', 'dzuhur', 'ashar', 'maghrib', 'isya');

-- CreateEnum
CREATE TYPE "PrayerStatus" AS ENUM ('ON_TIME', 'PERFORMED', 'MISSED');

-- AlterTable
ALTER TABLE "daily_prayer_schedules" DROP COLUMN "prayer_name",
ADD COLUMN     "prayer_name" "PrayerName" NOT NULL;

-- AlterTable
ALTER TABLE "prayer_logs" DROP COLUMN "prayer_name",
ADD COLUMN     "prayer_name" "PrayerName" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PrayerStatus" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "daily_prayer_schedules_user_id_date_prayer_name_key" ON "daily_prayer_schedules"("user_id", "date", "prayer_name");

-- CreateIndex
CREATE UNIQUE INDEX "prayer_logs_user_id_date_prayer_name_key" ON "prayer_logs"("user_id", "date", "prayer_name");
