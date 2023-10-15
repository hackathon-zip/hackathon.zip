-- CreateTable
CREATE TABLE "ProjectSubmissionField" (
    "id" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "placeholder" TEXT,
    "order" INTEGER NOT NULL,
    "hackathonId" TEXT NOT NULL,

    CONSTRAINT "ProjectSubmissionField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSubmissionField_attributeId_key" ON "ProjectSubmissionField"("attributeId");

-- AddForeignKey
ALTER TABLE "ProjectSubmissionField" ADD CONSTRAINT "ProjectSubmissionField_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "ProjectAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSubmissionField" ADD CONSTRAINT "ProjectSubmissionField_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
