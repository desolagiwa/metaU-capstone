const fs = require('fs');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const data = fs.readFileSync('/Users/faridagiwa/Desktop/routes.json', 'utf8');
    const routes = JSON.parse(data);

    console.log(routes[0]);

    const chunkSize = 1000;
    for (let i = 0; i < routes.length; i += chunkSize) {
      const chunk = routes.slice(i, i + chunkSize);
      await prisma.Route.createMany({
        data: chunk.map((route) => ({
          routeId: `${route.route_id}`,
          agencyId: route.agency_id,
          routeShortName: `${route.route_short_name}`,
          routeLongName: route.route_long_name,
          routeType: route.route_type,
          routeColor: `${route.route_color}`,
          routeTextColor: route.route_text_color,
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
