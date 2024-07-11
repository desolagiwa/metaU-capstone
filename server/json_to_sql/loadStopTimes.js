const fs = require('fs');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const data = fs.readFileSync('/Users/faridagiwa/Desktop/stop_times.json', 'utf8');
    const stopTimes = JSON.parse(data);

    console.log(stopTimes[0]);

    const chunkSize = 1000;
    for (let i = 0; i < stopTimes.length; i += chunkSize) {
      const chunk = stopTimes.slice(i, i + chunkSize);
      await prisma.stopTime.createMany({
        data: chunk.map((stopTime) => ({
          tripId: stopTime.trip_id,
          arrivalTime: `${String(stopTime.arrival_time.split(':')[0]).padStart(2, '0')}:${String(stopTime.arrival_time.split(':')[1]).padStart(2, '0')}:${String(stopTime.arrival_time.split(':')[2]).padStart(2, '0')}`,
          departureTime: `${String(stopTime.departure_time.split(':')[0]).padStart(2, '0')}:${String(stopTime.departure_time.split(':')[1]).padStart(2, '0')}:${String(stopTime.departure_time.split(':')[2]).padStart(2, '0')}`,
          stopId: stopTime.stop_id,
          stopSequence: stopTime.stop_sequence,
          pickupType: stopTime.pickup_type,
          dropOffType: stopTime.drop_off_type,
          shapeDistTraveled: stopTime.shape_dist_traveled,
          timepoint: stopTime.timepoint
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
