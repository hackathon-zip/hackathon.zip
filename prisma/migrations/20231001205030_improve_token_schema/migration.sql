/*
  Warnings:

  - The primary key for the `Token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[token]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[magicKey]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Token` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Attendee" ALTER COLUMN "checkInKey" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Token" DROP CONSTRAINT "Token_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "magicKey" TEXT,
ADD CONSTRAINT "Token_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Token_magicKey_key" ON "Token"("magicKey");
