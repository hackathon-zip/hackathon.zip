-- CreateEnum
CREATE TYPE "SignupFormStage" AS ENUM ('Initial', 'Supplementary');

-- CreateEnum
CREATE TYPE "AttendeeStatus" AS ENUM ('Pending', 'Applied', 'MarkedAccepted', 'MarkedRejected', 'Accepted', 'Rejected');

-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "status" "AttendeeStatus" NOT NULL DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "Hackathon" ADD COLUMN     "applicationsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SignupFormField" ADD COLUMN     "stage" "SignupFormStage" NOT NULL DEFAULT 'Initial';
