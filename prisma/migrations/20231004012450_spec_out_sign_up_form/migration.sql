/*
  Warnings:

  - You are about to drop the column `required` on the `AttendeeAttribute` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AttendeeAttribute" DROP COLUMN "required",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "SignupForm" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,

    CONSTRAINT "SignupForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignupFormField" (
    "id" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "plaecholder" TEXT,
    "order" INTEGER NOT NULL,
    "signupFormId" TEXT,

    CONSTRAINT "SignupFormField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignupForm_hackathonId_key" ON "SignupForm"("hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "SignupFormField_attributeId_key" ON "SignupFormField"("attributeId");

-- AddForeignKey
ALTER TABLE "SignupForm" ADD CONSTRAINT "SignupForm_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupFormField" ADD CONSTRAINT "SignupFormField_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "AttendeeAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupFormField" ADD CONSTRAINT "SignupFormField_signupFormId_fkey" FOREIGN KEY ("signupFormId") REFERENCES "SignupForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
