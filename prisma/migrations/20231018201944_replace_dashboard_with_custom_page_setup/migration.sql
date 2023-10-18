/*
  Warnings:

  - You are about to drop the `AttendeeDashboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttendeeDashboardCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttendeeDashboardLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AttendeeDashboard" DROP CONSTRAINT "AttendeeDashboard_hackathonId_fkey";

-- DropForeignKey
ALTER TABLE "AttendeeDashboardCard" DROP CONSTRAINT "AttendeeDashboardCard_attendeeDashboardId_fkey";

-- DropForeignKey
ALTER TABLE "AttendeeDashboardLink" DROP CONSTRAINT "AttendeeDashboardLink_cardId_fkey";

-- DropForeignKey
ALTER TABLE "AttendeeDashboardLink" DROP CONSTRAINT "AttendeeDashboardLink_dashboardId_fkey";

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_hackathonId_fkey";

-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "hackathonId" DROP NOT NULL;

-- DropTable
DROP TABLE "AttendeeDashboard";

-- DropTable
DROP TABLE "AttendeeDashboardCard";

-- DropTable
DROP TABLE "AttendeeDashboardLink";

-- CreateTable
CREATE TABLE "CustomPage" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,

    CONSTRAINT "CustomPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPageCard" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "customPageId" TEXT,

    CONSTRAINT "CustomPageCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPageLink" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cardId" TEXT,
    "customPageId" TEXT,

    CONSTRAINT "CustomPageLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomPage_hackathonId_key" ON "CustomPage"("hackathonId");

-- AddForeignKey
ALTER TABLE "CustomPage" ADD CONSTRAINT "CustomPage_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPageCard" ADD CONSTRAINT "CustomPageCard_customPageId_fkey" FOREIGN KEY ("customPageId") REFERENCES "CustomPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPageLink" ADD CONSTRAINT "CustomPageLink_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CustomPageCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPageLink" ADD CONSTRAINT "CustomPageLink_customPageId_fkey" FOREIGN KEY ("customPageId") REFERENCES "CustomPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
