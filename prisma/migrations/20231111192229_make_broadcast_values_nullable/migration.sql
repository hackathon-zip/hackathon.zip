-- AlterTable
ALTER TABLE "Broadcast" ALTER COLUMN "emailHTMLTemplate" DROP NOT NULL,
ALTER COLUMN "emailPlaintextTemplate" DROP NOT NULL,
ALTER COLUMN "smsTemplate" DROP NOT NULL;
