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
    const point = [stop.stopLon, stop.stopLat];
    if (pointInPolygon(point, polygon)) {
      stopsInPolygon.push(stop);
    }
  });

  const result = []
  stopsInPolygon.sort((a, b) => fetchDistance([refPoint, [a.stopLon, a.stopLat]]) - fetchDistance([refPoint, [b.stopLon, b.stopLat]]));
  result.push(...stopsInPolygon.slice(0, 10));

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
        range: [0, 0.2],
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
        range: [0, 0.2],
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
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

async function findDirectRoutes(startStops, endStops, visitedStop =0, pastTripIds=[0]) {
    const currentTime = new Date();
    const oneHourLater = new Date(currentTime.getTime() + 60 * 60 * 1000);
    const formattedCurrentTime = formatTime(currentTime);
    const formattedOneHourLater = formatTime(oneHourLater);

    const startStopTimes = await Prisma.StopTime.findMany({
        where: {
            OR: [
                { stopId: { in: startStops.map(ss => ss.stopId), not: {in : [visitedStop] } , not: {in: pastTripIds}} },
            ],
            departureTime: {
              gte: "10:00:00",
              lte: "11:00:00"
            },
        }
    });

    const endStopTimes = await Prisma.StopTime.findMany({
        where: {
            OR: [
                { stopId: { in: endStops.map(es => es.stopId)} }
            ],
            departureTime: {
                gte: "10:00:00",
                lte: "11:00:00"
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

 // There is some missing code here. It had to be taken out because there was too much load on the API
  const allConnectedStops = [...connectedStops, ...moreConnectedStops]

  return allConnectedStops

}

async function findRoutes(startStops, endStops, currentRoutes, directTrips){
  let maxTransfers = 2
  while (maxTransfers > 0) {
    for (const stop of endStops){
      const connectedStops = await getConnectedStops(stop)
      for (const cstop of connectedStops){
        if (startStops.some(sstop => sstop.stopId === cstop.stopId)){
          const route =  await findDirectRoutes([cstop], connectedStops, pastTripIds = directTrips)
          route.push(await findDirectRoutes(connectedStops, endStops, pastTripIds = directTrips))
          currentRoutes.push(route)
        }
      }
    }
    maxTransfers --
  }
  return currentRoutes
}


// This function can definitely be cleaner, but for the purpose of unblocking myself, I leaving it for now.
async function handleTransfers(routes){
  const updatedRoutes = []
  for (const route of routes){
    if (route.length == 1){
      updatedRoutes.push(route)
    } else {
      for (const subRoute of route){
        if (subRoute.length === 1){
          let transferStop = 0
          if (subRoute[0].stops[1]-subRoute[0].stops[0] === 1){
            transferStop = subRoute[0].stops[0]
          }else {
            transferStop = subRoute[0].stops[1]
          }
           let currentStop = [0,0]
          for (const subRoute2 of route){
            if (subRoute2.length > 1){
              for (const trip of subRoute2){
                if (trip[0].stops[0] !== currentStop[0] && trip[0].stops[1] !== currentStop[1]) {
                  currentStop = trip[0].stops
                  const initialRoutes = await findDirectRoutes([{stopId: transferStop}], [{stopId: currentStop[0]}])
                  const subsequentRoutes = await findDirectRoutes([{stopId: currentStop[0]}], [{stopId: currentStop[1]}])
                  updatedRoutes.push([initialRoutes, subsequentRoutes])
                }
              }
            }
          }
        }
      }
    }
  }
  return updatedRoutes
}


// This function should use helper functions
async function getRouteOptions(routes){
  const routeOptions = []
  for (const route of routes){
    if (route.length ===1){
      const current = route[0]
      const currentTrip = await Prisma.Trip.findMany({where : {tripId : current.tripId}})
      const startStop = await Prisma.Stop.findMany({where : {stopId : current.stops[0]}})
      const endStop = await Prisma.Stop.findMany({where : {stopId : current.stops[1]}})
      const startStopTime = await Prisma.StopTime.findMany({where : {stopId : current.stops[0], tripId: current.tripId}})
      const endStopTime = await Prisma.StopTime.findMany({where : {stopId : current.stops[1], tripId: current.tripId}})

      const stops = await Prisma.StopTime.findMany({
        where: { tripId: current.tripId },
        orderBy: { stopSequence: 'asc' }
      });

      const stopCoordinatesPromises = stops.map(async (stop) => {
      const stopDetails = await Prisma.Stop.findUnique({ where: { stopId: stop.stopId } });
      return {
        stopId: stop.stopId,
        stopName: stop.stopName,
        coordinates: [stopDetails.stopLon, stopDetails.stopLat],
        stopSequence: stop.stopSequence

      };
      });

      let stopCoordinates = await Promise.all(stopCoordinatesPromises);
      const startStopSequence = startStopTime[0].stopSequence;
      const endStopSequence = endStopTime[0].stopSequence;
      stopCoordinates = stopCoordinates.filter(stop => stop.stopSequence >= startStopSequence && stop.stopSequence <= endStopSequence);

      const departureTimes = startStopTime.map(stopTime => stopTime.departureTime);
      const arrivalTimes = endStopTime.map(stopTime => stopTime.arrivalTime);

      routeOptions.push({tripId: currentTrip[0].tripId, tripHeadsign: currentTrip[0].tripHeadsign, routeId: currentTrip[0].routeId, startStopId: startStop[0].stopId, endStopId: endStop[0].stopId,
        startStopName: startStop[0].stopName, endStopName: endStop[0].stopName, startStopLat: startStop[0].stopLat, startStopLon: startStop[0].stopLon, endStopLat: endStop[0].stopLat, endStopLon: endStop[0].stopLon,
        stopCoordinates, departureTimes, arrivalTimes})
    }
    else{
      const temp = []
      for (const subRoute of route){
        if (subRoute.length ===1){
          const current = subRoute[0]
          const currentTrip = await Prisma.Trip.findMany({where : {tripId : current.tripId}})
          const startStop = await Prisma.Stop.findMany({where : {stopId : current.stops[0]}})
          const endStop = await Prisma.Stop.findMany({where : {stopId : current.stops[1]}})
          const startStopTime = await Prisma.StopTime.findMany({where : {stopId : current.stops[0], tripId: current.tripId}})
          const endStopTime = await Prisma.StopTime.findMany({where : {stopId : current.stops[1], tripId: current.tripId}})

          const stops = await Prisma.StopTime.findMany({
            where: { tripId: current.tripId },
            orderBy: { stopSequence: 'asc' }
          });

          const stopCoordinatesPromises = stops.map(async (stop) => {
            const stopDetails = await Prisma.Stop.findUnique({ where: { stopId: stop.stopId } });
            return {
              stopId: stop.stopId,
              stopName: stop.stopName,
              coordinates: [stopDetails.stopLon, stopDetails.stopLat],
              stopSequence: stop.stopSequence

            };
           });

          let stopCoordinates = await Promise.all(stopCoordinatesPromises);
          const startStopSequence = startStopTime[0].stopSequence;
          const endStopSequence = endStopTime[0].stopSequence;
          stopCoordinates = stopCoordinates.filter(stop => stop.stopSequence >= startStopSequence && stop.stopSequence <= endStopSequence);

          const departureTimes = startStopTime.map(stopTime => stopTime.departureTime);
          const arrivalTimes = endStopTime.map(stopTime => stopTime.arrivalTime);

          temp.push({tripId: currentTrip[0].tripId, tripHeadsign: currentTrip[0].tripHeadsign, routeId: currentTrip[0].routeId, startStopId: startStop[0].stopId, endStopId: endStop[0].stopId,
            startStopName: startStop[0].stopName, endStopName: endStop[0].stopName, startStopLat: startStop[0].stopLat, startStopLon: startStop[0].stopLon, endStopLat: endStop[0].stopLat, endStopLon: endStop[0].stopLon,
            stopCoordinates, departureTimes, arrivalTimes})
        }
        else{
          const temp2 = []
          for (const trip of subRoute){
            if (trip.length ===1){
              const current = trip[0]
              const currentTrip = await Prisma.Trip.findMany({where : {tripId : current.tripId}})
              const startStop = await Prisma.Stop.findMany({where : {stopId : current.stops[0]}})
              const endStop = await Prisma.Stop.findMany({where : {stopId : current.stops[1]}})
              const startStopTime = await Prisma.StopTime.findMany({where : {stopId : current.stops[0], tripId: current.tripId}})
              const endStopTime = await Prisma.StopTime.findMany({where : {stopId : current.stops[1], tripId: current.tripId}})

              const stops = await Prisma.StopTime.findMany({
                where: { tripId: current.tripId },
                orderBy: { stopSequence: 'asc' }
              });

              const stopCoordinatesPromises = stops.map(async (stop) => {
              const stopDetails = await Prisma.Stop.findUnique({ where: { stopId: stop.stopId } });
                return {
                  stopId: stop.stopId,
                  stopName: stop.stopName,
                  coordinates: [stopDetails.stopLon, stopDetails.stopLat],
                  stopSequence: stop.stopSequence
                };
              });

              let stopCoordinates = await Promise.all(stopCoordinatesPromises);
              const startStopSequence = startStopTime[0].stopSequence;
              const endStopSequence = endStopTime[0].stopSequence;
              stopCoordinates = stopCoordinates.filter(stop => stop.stopSequence >= startStopSequence && stop.stopSequence <= endStopSequence);
              const departureTimes = startStopTime.map(stopTime => stopTime.departureTime);
              const arrivalTimes = endStopTime.map(stopTime => stopTime.arrivalTime);

              temp2.push({tripId: currentTrip[0].tripId, tripHeadsign: currentTrip[0].tripHeadsign, routeId: currentTrip[0].routeId, startStopId: startStop[0].stopId, endStopId: endStop[0].stopId,
                startStopName: startStop[0].stopName, endStopName: endStop[0].stopName, startStopLat: startStop[0].stopLat, startStopLon: startStop[0].stopLon, endStopLat: endStop[0].stopLat, endStopLon: endStop[0].stopLon,
                stopCoordinates, departureTimes, arrivalTimes})
            }
          }
          temp.push(temp2)
        }
      }
      routeOptions.push(temp)
    }
  }
  return routeOptions
}


router.post('/', async (req, res) => {
    const { startCoordinates, endCoordinates } = req.body;

    try {
      const startPolygon = await fetchCurrentRadius(startCoordinates);
      const endPolygon = await fetchDestinationRadius(endCoordinates);

      if (startPolygon && endPolygon) {
        console.log(startPolygon)
        const stops  = await Prisma.Stop.findMany();

        const startStops = startPolygon.features ? getStopsInPolygon(stops, startPolygon.features[0].geometry, startCoordinates):[];
        const endStops = endPolygon.features ? getStopsInPolygon(stops, endPolygon.features[0].geometry, endCoordinates):[];

        const directRoutes = await findDirectRoutes(startStops, endStops)
        const directTrips = directRoutes.map(route => route[0].tripId);
        console.log(directRoutes)

        const routes = await findRoutes(startStops, endStops, directRoutes, directTrips)

        const modifiedRoutes= await handleTransfers(routes)
        const routeOptions = await getRouteOptions(modifiedRoutes)

        res.json(routeOptions);
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

module.exports = router;
