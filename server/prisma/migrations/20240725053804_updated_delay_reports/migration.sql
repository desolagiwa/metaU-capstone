-- AlterTable
ALTER TABLE "trips" ALTER COLUMN "delayedMin" DROP NOT NULL,
ALTER COLUMN "delayedMin" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "DelayReport" ADD CONSTRAINT "DelayReport_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;
