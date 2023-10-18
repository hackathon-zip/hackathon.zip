/*
  Warnings:

  - Added the required column `slug` to the `CustomPage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomPage" ADD COLUMN     "slug" TEXT NOT NULL;
