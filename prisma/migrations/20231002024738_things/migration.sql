-- AlterTable
ALTER TABLE "Hackathon" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "broadcastEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "checkInEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "financeEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hcbId" TEXT,
ADD COLUMN     "integrateEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "registerEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shipEnabled" BOOLEAN NOT NULL DEFAULT false;
