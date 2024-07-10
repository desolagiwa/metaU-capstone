const fs = require('fs');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const data = fs.readFileSync('/Users/faridagiwa/Desktop/trips.json', 'utf8');
    const trips = JSON.parse(data);

    console.log(trips[0]);

    const chunkSize = 1000;
    for (let i = 0; i < trips.length; i += chunkSize) {
      const chunk = trips.slice(i, i + chunkSize);
      await prisma.Trip.createMany({
        data: chunk.map((trip) => ({
          tripId: trip.trip_id,
          routeId: `${trip.route_id}`,
          serviceId: trip.service_id,
          tripHeadsign: trip.trip_headsign,
          directionId: trip.direction_id,
          blockId: trip.block_id,
          shapeId: trip.shape_id,
          wheelchairAccessible: trip.wheelchair_accessible,
          bikesAllowed: trip.bikes_allowed
        })),
        skipDuplicates: true
      });
      console.log(`Inserted ${i + chunkSize} records`);
    }

    console.log('Data loading complete');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
