/*
  Warnings:

  - Made the column `location` on table `Hackathon` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Hackathon" ALTER COLUMN "location" SET NOT NULL;
