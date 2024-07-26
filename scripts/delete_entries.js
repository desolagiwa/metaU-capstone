const fs = require('fs');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const Prisma = new PrismaClient();

async function main() {
  try {
    const chunkSize = 1000;
    let totalDeleted = 0;
    let count;

    do {
      count = await Prisma.Stop.count();

      if (count === 0) {
        break;
      }

      await Prisma.Stop.deleteMany({
        take: chunkSize,
      });

      totalDeleted += Math.min(count, chunkSize);
      console.log(`Deleted ${totalDeleted} records`);
    } while (count > 0);

    console.log('All entries in Stops successfully deleted.');
  } catch (e) {
    console.error(e);
  } finally {
    await Prisma.$disconnect();
  }
}

main();
