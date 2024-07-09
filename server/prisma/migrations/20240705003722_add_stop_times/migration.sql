-- CreateTable
CREATE TABLE "stop_times" (
    "id" SERIAL NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "arrival_time" TEXT NOT NULL,
    "departure_time" TEXT NOT NULL,
    "stop_id" INTEGER NOT NULL,
    "stop_sequence" INTEGER NOT NULL,
    "stop_headsign" TEXT NOT NULL,
    "pickup_type" INTEGER NOT NULL,
    "drop_off-type" INTEGER NOT NULL,
    "shape_dist-traveled" DOUBLE PRECISION NOT NULL,
    "timepoint" INTEGER NOT NULL,

    CONSTRAINT "stop_times_pkey" PRIMARY KEY ("id")
);
