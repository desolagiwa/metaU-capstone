-- CreateTable
CREATE TABLE "trips" (
    "id" SERIAL NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "route_id" TEXT NOT NULL,
    "service_id" INTEGER NOT NULL,
    "trip_headsign" TEXT NOT NULL,
    "direction_id" INTEGER NOT NULL,
    "block_id" INTEGER NOT NULL,
    "shape_id" TEXT NOT NULL,
    "wheelchair_accessible" INTEGER NOT NULL,
    "bikes_allowed" INTEGER NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" SERIAL NOT NULL,
    "route_id" TEXT NOT NULL,
    "agency_id" INTEGER NOT NULL,
    "route_short_name" TEXT NOT NULL,
    "route_long_name" TEXT NOT NULL,
    "route_type" INTEGER NOT NULL,
    "route_color" TEXT NOT NULL,
    "route_text_color" TEXT NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stops" (
    "id" SERIAL NOT NULL,
    "stop_id" INTEGER NOT NULL,
    "stop_code" INTEGER NOT NULL,
    "stop_name" TEXT NOT NULL,
    "stop_lat" INTEGER NOT NULL,
    "stop_lon" INTEGER NOT NULL,
    "wheelchair_boarding" INTEGER NOT NULL,

    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);
