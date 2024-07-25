-- CreateTable
CREATE TABLE "DelayReport" (
    "id" SERIAL NOT NULL,
    "tripId" INTEGER NOT NULL,
    "routeId" TEXT NOT NULL,
    "delayMin" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DelayReport_pkey" PRIMARY KEY ("id")
);
