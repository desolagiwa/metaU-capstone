const fs = require('fs');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const data = fs.readFileSync('/Users/faridagiwa/Desktop/stops.json', 'utf8');
    const stops = JSON.parse(data);

    console.log(stops[0]);

    const chunkSize = 1000;
    for (let i = 0; i < stops.length; i += chunkSize) {
      const chunk = stops.slice(i, i + chunkSize);
      await prisma.Stop.createMany({
        data: chunk.map((stop) => ({
          stopId: stop.stop_id,
          stopCode: stop.stop_code,
          stopName: stop.stop_name,
          stopLat: stop.stop_lat,
          stopLon: stop.stop_lon,
          wheelchairBoarding: stop.wheelchair_boarding,
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
