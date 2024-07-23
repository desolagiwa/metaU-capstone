function parseSearchData(data) {
    if (!data){
        return []
    }
    const result = []

    for (let i=0;i<data.features.length; i++){
        const address = data.features[i].properties.label
        const coordinates = data.features[i].geometry.coordinates
        result.push({address:address, coordinates: coordinates})
    }
    return result
}

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


function getStopsInPolygon(data, polygon) {
  const stopsInPolygon = [];

  data.forEach(stop => {
    const point = [stop.stop_lon, stop.stop_lat];
    if (pointInPolygon(point, polygon)) {
      stopsInPolygon.push(stop);
    }
  });

  return stopsInPolygon;
}

function midpoint(coord1, coord2) {
  // Convert coordinates from decimal degrees to radians
  const [lat1, lon1] = coord1.map(n => n * Math.PI / 180);
  const [lat2, lon2] = coord2.map(n => n * Math.PI / 180);

  // Calculate the sum of the coordinates for the midpoint formula
  const sumX = Math.cos(lat1) * Math.cos(lon1) + Math.cos(lat2) * Math.cos(lon2);
  const sumY = Math.cos(lat1) * Math.sin(lon1) + Math.cos(lat2) * Math.sin(lon2);
  const sumZ = Math.sin(lat1) + Math.sin(lat2);

  // Calculate the average of the sums
  const avgX = sumX / 2;
  const avgY = sumY / 2;
  const avgZ = sumZ / 2;

  // Calculate the longitude of the midpoint using the atan2 function
  const lon = Math.atan2(avgY, avgX);
  // Calculate the hypotenuse for the latitude calculation
  const hyp = Math.sqrt(avgX * avgX + avgY * avgY);
  // Calculate the latitude of the midpoint
  const lat = Math.atan2(avgZ, hyp);

  // Convert the midpoint coordinates back to decimal degrees
  const midpointLat = lat * 180 / Math.PI;
  const midpointLon = lon * 180 / Math.PI;

  return [midpointLat, midpointLon];
}

function parseRouteData(data) {
  let tripMaps = [];
  const uniqueTrips = new Set();

  function processTrip(trip) {
    const processedTrip = {
      tripIds: [trip.tripId],
      tripHeadsign: trip.tripHeadsign,
      routeId: trip.routeId,
      startStopId: trip.startStopId,
      startStopName: trip.startStopName,
      endStopName: trip.endStopName,
      endStopId: trip.endStopId,
      stopCoordinates: trip.stopCoordinates,
      startStopCoordinates: [trip.startStopLon, trip.startStopLat],
      endStopCoordinates: [trip.endStopLon, trip.endStopLat],
      departureTimes: trip.departureTimes,
      arrivalTimes: trip.arrivalTimes,
      isDelayed: trip.isDelayed,
      delayedMin: trip.delayedMin,
      transfers: []
    };

    return processedTrip;
  }

  // Helper function to check and merge similar trips
  function mergeTrips(existingTrip, newTrip) {
    existingTrip.tripIds = Array.from(new Set([...existingTrip.tripIds, ...newTrip.tripIds]))
    existingTrip.departureTimes = Array.from(new Set([...existingTrip.departureTimes, ...newTrip.departureTimes]));
    existingTrip.arrivalTimes = Array.from(new Set([...existingTrip.arrivalTimes, ...newTrip.arrivalTimes]));
    existingTrip.isDelayed =  existingTrip.isDelayed || newTrip.isDelayed
    existingTrip.delayedMin = Math.max(existingTrip.delayedMin, newTrip.delayedMin)
  }

  // Recursive function to flatten nested trip data
  function flattenTrips(data) {
    data.forEach(item => {
      if (Array.isArray(item)) {
        flattenTrips(item);
      } else {
        const processedTrip = processTrip(item);
        const existingTrip = tripMaps.find(t =>
          t.startStopId === processedTrip.startStopId &&
          t.endStopId === processedTrip.endStopId &&
          t.routeId === processedTrip.routeId &&
          t.tripHeadsign === processedTrip.tripHeadsign
        );

        if (existingTrip) {
          mergeTrips(existingTrip, processedTrip);
        } else {
          tripMaps.push(processedTrip);
        }
      }
    });
  }

  function linkTransfers() {
    const tripsToRemove = [];

    tripMaps.forEach(trip => {
      tripMaps.forEach(possibleTransfer => {
        if (trip.endStopId === possibleTransfer.startStopId) {
          if (!trip.transfers.some(t =>
            t.startStopId === possibleTransfer.startStopId &&
            t.endStopId === possibleTransfer.endStopId
          )) {
            trip.transfers.push({ ...possibleTransfer });  // Ensure a new object is created for the transfer
            tripsToRemove.push(possibleTransfer);
          }
        }
      });
    });

    tripMaps = tripMaps.filter(trip => !tripsToRemove.includes(trip));
  }

  // Start processing
  flattenTrips(data);
  linkTransfers();

  return tripMaps;
}


function getRandomColor() {
  const colors = [
    '#FF0000',
    '#FF8700',
    '#FFD300',
    '#DEFF0A',
    '#A1FF0A',
    '#0AFF99',
    '#0AEFFF',
    '#147DF5',
    '#580AFF',
    '#BE0AFF',

  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function convertCoordinates(coordString) {
  return coordString.split(',').map(Number);
}

function getTimeDifference(departureTimes, arrivalTimes){
  const time1Minutes = parseInt(departureTimes[0].substring(0, 2)) * 60 + parseInt(departureTimes[0].substring(3, 5));
const time2Minutes = parseInt(arrivalTimes[0].substring(0, 2)) * 60 + parseInt(arrivalTimes[0].substring(3, 5));
const differenceMinutes = time2Minutes - time1Minutes;
return differenceMinutes
}

function encodeUrlParams(params){
  return `startLat%3A${params[0][0]}%2CstartLon%3A${params[0][1]}/endLat%3A${params[1][0]}%2CendLon%3A${params[1][1]}`
}




export { parseSearchData, pointInPolygon, getStopsInPolygon, midpoint, parseRouteData, getRandomColor, convertCoordinates, getTimeDifference, encodeUrlParams}
