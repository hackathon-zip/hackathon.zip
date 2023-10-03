/*
  Warnings:

  - A unique constraint covering the columns `[hackathonId]` on the table `AttendeeDashboard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hackathonId` to the `AttendeeDashboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttendeeDashboard" ADD COLUMN     "hackathonId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AttendeeDashboard_hackathonId_key" ON "AttendeeDashboard"("hackathonId");

-- AddForeignKey
ALTER TABLE "AttendeeDashboard" ADD CONSTRAINT "AttendeeDashboard_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
