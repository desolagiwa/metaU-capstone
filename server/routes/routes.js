const express = require('express');
const moment = require('moment')
const dotenv = require('dotenv')


const { PrismaClient } = require('@prisma/client');
const Prisma = new PrismaClient()

const router = express.Router();

const apiKey = process.env.MAP_API_KEY

// There are a couple of functions here that ought to be in the utils.js file.
// I included them here because they was a problem with importing/exporting them, and I wanted to unblock myself.


function pointInPolygon(point, polygon) {
  // Extract the point coordinates
  const x = point[0];
  const y = point[1];

  // Extract the polygon vertices
  const vertices = polygon.coordinates[0];

  // Initialize a flag to track whether the point is inside
  let inside = false;

  // Iterate over the polygon vertices
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0];
    const yi = vertices[i][1];
    const xj = vertices[j][0];
    const yj = vertices[j][1];

    // Check if the point is within the y-range of the current edge
    if ((yi <= y && y < yj) || (yj <= y && y < yi)) {
      // Calculate the slope of the edge
      const slope = (xj - xi) * (y - yi) / (yj - yi) + xi;

      // Check if the point is to the left of the edge
      if (x < slope) {
        // Flip the inside flag
        inside = !inside;
      }
    }
  }
  return inside; // Return true if the point is inside, false otherwise
}

function getStopsInPolygon(data, polygon, refPoint) {
  const stopsInPolygon = [];

  data.forEach(stop => {
    const point = [stop.stop_lon, stop.stop_lat];
    if (pointInPolygon(point, polygon)) {
      stopsInPolygon.push(stop);
    }
  });

  const result = []
  stopsInPolygon.sort((a, b) => fetchDistance([refPoint, [a.stopLon, a.stopLat]]) - fetchDistance([refPoint, [b.stopLon, b.stopLat]]));
  result.push(...stopsInPolygon.slice(0, 20));

  return result;
}

const fetchCurrentRadius = async (startCoordinates) => {
    try {
      const response = await fetch('https://api.openrouteservice.org/v2/isochrones/foot-walking', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Authorization': apiKey,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        locations: [startCoordinates],
        range: [0, 0.5],
        location_type: 'start',
        range_type: 'distance',
        units: 'mi'
      })
    })
      const data =  await response.json();
        return data
    }
    catch(error) {
      console.error('Error:', error);
    };
  }

const fetchDestinationRadius = async ( endCoordinates) => {
    try {
    const response = await fetch('https://api.openrouteservice.org/v2/isochrones/foot-walking', {
    method: 'POST',
    headers: {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Authorization': apiKey,
        'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
        locations: [endCoordinates],
        range: [0, 0.5],
        location_type: 'start',
        range_type: 'distance',
        units: 'mi'
    })
    })
    const data =  await response.json();
    return data
    }
    catch(error) {
    console.error('Error:', error);
    };
}

const fetchDistance = async (coordinates) => {
    const response = await fetch('https://api.openrouteservice.org/v2/matrix/foot-walking', {
        method: 'POST',
        body: JSON.stringify({
          "locations": coordinates,
          "destinations": [1],
          "metrics": ["distance"],
          "units": "m"
        }),
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Authorization': apiKey,
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
    const data =  await response.json();
    if (data.distances)
    {return data.distances[0][0]}

}

async function getStopsWithinRadius(stop){
    const coordinates = [stop.stopLon, stop.stopLat]
    const polygon = await fetchCurrentRadius(coordinates)
    const stops = await Prisma.Stop.findMany()
    const stopsInPolygon = polygon.features ? getStopsInPolygon(stops, polygon.features[0].geometry, coordinates) : []
    return stopsInPolygon
}

function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours}:${minutes}:${seconds}`;
}

async function findDirectRoutes(startStops, endStops, visitedStop =0, pastTripId=0) {
    const currentTime = new Date();
    const oneHourLater = new Date(currentTime.getTime() + 60 * 60 * 1000);
    const formattedCurrentTime = formatTime(currentTime);
    const formattedOneHourLater = formatTime(oneHourLater);

    const startStopTimes = await Prisma.StopTime.findMany({
        where: {
            OR: [
                { stopId: { in: startStops.map(ss => ss.stopId), not: {in : [visitedStop] } } },
            ],
            departureTime: {
                gte: formattedCurrentTime,
                lte: formattedOneHourLater
            },
            NOT: [
                { tripId: pastTripId }
            ]
        }
    });

    const endStopTimes = await Prisma.StopTime.findMany({
        where: {
            OR: [
                { stopId: { in: endStops.map(es => es.stopId)} }
            ],
            departureTime: {
                gte: formattedCurrentTime,
                lte: formattedOneHourLater
            }
        }
    });

    let routes = [];
    let prevTripId = 0
    startStopTimes.forEach(sstime => {
        endStopTimes.forEach(estime =>{
            if (sstime.tripId === estime.tripId && estime.stopSequence > sstime.stopSequence && prevTripId != sstime.tripId){
                const directRoute = {stops : [sstime.stopId, estime.stopId], tripId: estime.tripId}
                prevTripId = sstime.tripId
                if (directRoute){
                    routes.push([directRoute])
                }
            }
        })
    })

    return routes;
}


async function getConnectedStops(stop){
  const connectedTrips = await Prisma.StopTime.findMany({
    where: {
        OR: [
            { stopId: stop.stopId }
        ],
    }
  });
  const uniqueTripIds = connectedTrips.map(item => ({ tripId: item.tripId, stopSequence: item.stopSequence })).filter((value, index, self) => self.findIndex(t => t.tripId === value.tripId) === index);

  const connectedStopTimes = await Prisma.StopTime.findMany({
    where: {
      tripId: { in: uniqueTripIds.map(item => item.tripId) },
      stopSequence: { gt: uniqueTripIds[0].stopSequence }
    }
  });

  const connectedStopIds = [...new Set(connectedStopTimes.map(item => item.stopId))];
  const connectedStops = await Prisma.Stop.findMany({
    where: {
      stopId: { in: connectedStopIds },
    }
  });

  const moreConnectedStops = []
  connectedStops.forEach( async stop => {
    const nearbyStops = await getStopsWithinRadius(stop)
    moreConnectedStops.push(nearbyStops)
  })
  const allConnectedStops = [...connectedStops, ...moreConnectedStops]

  return allConnectedStops

}

async function findRoutes(startStops, endStops, currentRoutes){
    for (const stop of endStops){
      const connectedStops = await getConnectedStops(stop)
      for (const cstop of connectedStops){
        if (startStops.some(sstop => sstop.stopId === cstop.stopId)){
          const route =  await findDirectRoutes([cstop], connectedStops)
          route.push(await findDirectRoutes(connectedStops, endStops))
          currentRoutes.push(route)
        }
      }
    }
    return currentRoutes
}


router.get('/', async (req, res) => {
    const { startCoordinates, endCoordinates } = req.body;

    try {
      const startPolygon = await fetchCurrentRadius(startCoordinates);
      const endPolygon = await fetchDestinationRadius(endCoordinates);

      if (startPolygon && endPolygon) {
        const stops  = await Prisma.Stop.findMany();

        const startStops = startPolygon.features ? getStopsInPolygon(stops, startPolygon.features[0].geometry, startCoordinates):[];
        const endStops = endPolygon.features ? getStopsInPolygon(stops, endPolygon.features[0].geometry, endCoordinates):[];

        const directRoutes = await findDirectRoutes(startStops, endStops)

        const routes = await findRoutes(startStops, endStops, directRoutes)

        res.json(routes);
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

module.exports = router;
