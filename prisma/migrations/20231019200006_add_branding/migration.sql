-- CreateEnum
CREATE TYPE "BrandingItemType" AS ENUM ('Logo', 'Banner', 'StickerDesign', 'TShirtDesign');

-- AlterTable
ALTER TABLE "Hackathon" ADD COLUMN     "brandingEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BrandingItem" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "BrandingItemType" NOT NULL,

    CONSTRAINT "BrandingItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BrandingItem" ADD CONSTRAINT "BrandingItem_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
