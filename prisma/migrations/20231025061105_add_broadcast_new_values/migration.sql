-- DropIndex
DROP INDEX "Attendee_email_key";

-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "attendeeId" TEXT NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentBroadcast" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,

    CONSTRAINT "SentBroadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broadcast" (
    "id" TEXT NOT NULL,
    "emailHTMLTemplate" TEXT NOT NULL,
    "emailPlaintextTemplate" TEXT NOT NULL,
    "smsTemplate" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parent_attendeeId_key" ON "Parent"("attendeeId");

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentBroadcast" ADD CONSTRAINT "SentBroadcast_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Broadcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentBroadcast" ADD CONSTRAINT "SentBroadcast_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
