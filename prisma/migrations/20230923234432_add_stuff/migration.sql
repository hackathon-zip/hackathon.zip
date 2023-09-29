-- CreateTable
CREATE TABLE "Hackathon" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "website" TEXT,
    "ownerId" TEXT NOT NULL,
    "collaboratorIds" TEXT[],

    CONSTRAINT "Hackathon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendeeAttribute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT[],
    "required" BOOLEAN NOT NULL,
    "hackathonId" TEXT NOT NULL,

    CONSTRAINT "AttendeeAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendeeAttributeValue" (
    "id" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,
    "formFieldId" TEXT NOT NULL,

    CONSTRAINT "AttendeeAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkInKey" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hackathon_slug_key" ON "Hackathon"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_email_key" ON "Attendee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_checkInKey_key" ON "Attendee"("checkInKey");

-- AddForeignKey
ALTER TABLE "AttendeeAttribute" ADD CONSTRAINT "AttendeeAttribute_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendeeAttributeValue" ADD CONSTRAINT "AttendeeAttributeValue_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendeeAttributeValue" ADD CONSTRAINT "AttendeeAttributeValue_formFieldId_fkey" FOREIGN KEY ("formFieldId") REFERENCES "AttendeeAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
