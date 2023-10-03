-- CreateTable
CREATE TABLE "AttendeeDashboard" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "AttendeeDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendeeDashboardCard" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "attendeeDashboardId" TEXT,

    CONSTRAINT "AttendeeDashboardCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendeeDashboardLink" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cardId" TEXT,
    "dashboardId" TEXT,

    CONSTRAINT "AttendeeDashboardLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AttendeeDashboardCard" ADD CONSTRAINT "AttendeeDashboardCard_attendeeDashboardId_fkey" FOREIGN KEY ("attendeeDashboardId") REFERENCES "AttendeeDashboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendeeDashboardLink" ADD CONSTRAINT "AttendeeDashboardLink_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "AttendeeDashboardCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendeeDashboardLink" ADD CONSTRAINT "AttendeeDashboardLink_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "AttendeeDashboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
