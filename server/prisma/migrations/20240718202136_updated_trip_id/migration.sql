/*
  Warnings:

  - The primary key for the `trips` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `trips` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "trips" DROP CONSTRAINT "trips_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("trip_id");
