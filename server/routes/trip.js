const express = require('express');
const { PrismaClient } = require('@prisma/client');
const Prisma = new PrismaClient();
const router = express.Router();

router.put('/:tripId/report', async (req, res) => {
  const { tripId } = req.params;
  const { isDelayed } = req.body;
  try {
    const updatedTrip = await Prisma.Trip.update({
      where: { tripId: parseInt(tripId) },
      data: { isDelayed }
    });
    res.json(updatedTrip);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/delay-time', async (req, res) => {
  const { tripId, routeId, delayMin } = req.body;
  try {
    const newReport = await Prisma.DelayReport.create({
      data: {
        routeId: routeId,
        delayMin: parseInt(delayMin),
        Trip: {
          connect: {
            tripId: parseInt(tripId)
          }
        }
      }
    });
    await updateTripDelayTime(tripId);
    res.json(newReport);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/:tripId/delay-time', async (req, res) => {
  const { tripId } = req.params;
  try {
    // Calculate the weighted average delay time based on all reports for this trip
    const weightedAverageDelay = await calculateWeightedAverageDelay(tripId);
    res.json({ delayMin: Math.round(weightedAverageDelay) });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Function to calculate the weighted average delay time
const calculateWeightedAverageDelay = async (tripId) => {
  const delayReports = await Prisma.DelayReport.findMany({
    where: { tripId: parseInt(tripId), delayMin: { not: 0 } },
    orderBy: { createdAt: 'desc' }
  });
  // Apply weighted average calculation
  const now = new Date();
  let totalWeight = 0;
  let weightedSum = 0;
  delayReports.forEach(report => {
    const timeDiff = (now - report.createdAt) / (1000 * 60); // time difference in minutes
    const weight = Math.exp(-timeDiff / 60); // weight decreases with time
    totalWeight += weight;
    weightedSum += report.delayMin * weight;
  });
  return weightedSum / totalWeight;
};

// Function to update the trip's delay time
const updateTripDelayTime = async (tripId) => {
  const weightedAverageDelay = await calculateWeightedAverageDelay(tripId);
  await Prisma.Trip.update({
    where: { tripId: parseInt(tripId) },
    data: { delayMin: Math.round(weightedAverageDelay) }
  });
};

module.exports = router;
