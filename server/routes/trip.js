const express = require('express');
const moment = require('moment')
const dotenv = require('dotenv')


const { PrismaClient } = require('@prisma/client');
const Prisma = new PrismaClient()

const router = express.Router();

const apiKey = process.env.MAP_API_KEY

router.put('/:tripId', async (req, res) => {
    const { tripId } = req.params
    const { isDelayed } = req.body
    const updatedTrip = await Prisma.Trip.update({
      where: { tripId: parseInt(tripId) },
      data: {
       isDelayed
      }
    })
    res.json(updatedTrip)
  })

module.exports = router;
