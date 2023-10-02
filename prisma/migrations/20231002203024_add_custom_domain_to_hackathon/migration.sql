/*
  Warnings:

  - A unique constraint covering the columns `[customDomain]` on the table `Hackathon` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Hackathon" ADD COLUMN     "customDomain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Hackathon_customDomain_key" ON "Hackathon"("customDomain");
