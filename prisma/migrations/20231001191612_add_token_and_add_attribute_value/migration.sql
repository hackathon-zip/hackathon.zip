/*
  Warnings:

  - Added the required column `value` to the `AttendeeAttributeValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttendeeAttributeValue" ADD COLUMN     "value" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Token" (
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendeeId" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("token")
);

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
