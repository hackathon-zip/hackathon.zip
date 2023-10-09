-- DropForeignKey
ALTER TABLE "AttendeeAttributeValue" DROP CONSTRAINT "AttendeeAttributeValue_attendeeId_fkey";

-- DropForeignKey
ALTER TABLE "AttendeeAttributeValue" DROP CONSTRAINT "AttendeeAttributeValue_formFieldId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_attendeeId_fkey";

-- AddForeignKey
ALTER TABLE "AttendeeAttributeValue" ADD CONSTRAINT "AttendeeAttributeValue_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendeeAttributeValue" ADD CONSTRAINT "AttendeeAttributeValue_formFieldId_fkey" FOREIGN KEY ("formFieldId") REFERENCES "AttendeeAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
