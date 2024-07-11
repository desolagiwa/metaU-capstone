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

  // Helper function to flatten nested arrays
function parseRouteData(data) {
  function flatten(arr) {
      return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
  }

  // Flatten the input data
  let flattenedData = flatten(data);

  // Helper function to find the index of the first trip that starts at a given stop
  function findStartIndex(arr, startStopId) {
      return arr.findIndex(trip => trip.startStopId === startStopId);
  }

  // Process the flattened data to account for direct and transfer routes
  let journeys = [];
  let visitedTrips = new Set();

  flattenedData.forEach(trip => {
      if (visitedTrips.has(trip.tripId)) {
          return; // Skip already processed trips
      }

      let journey = {
          trips: [],
          stopIds: [],
          routeIds: [],
          coordinates: []
      };

      let currentTrip = trip;
      while (currentTrip) {
          journey.trips.push(currentTrip.tripId);
          journey.stopIds.push(currentTrip.startStopId, currentTrip.endStopId);
          journey.routeIds.push(currentTrip.routeId);
          journey.coordinates.push(
              { lat: currentTrip.startStopLat, lon: currentTrip.startStopLon },
              { lat: currentTrip.endStopLat, lon: currentTrip.endStopLon }
          );

          visitedTrips.add(currentTrip.tripId);

          // Find the next trip that starts at the current trip's end stop
          let nextIndex = findStartIndex(flattenedData, currentTrip.endStopId);
          if (nextIndex !== -1 && !visitedTrips.has(flattenedData[nextIndex].tripId)) {
              currentTrip = flattenedData[nextIndex];
          } else {
              currentTrip = null;
          }
      }

      // Remove duplicate stop IDs and coordinates
      journey.stopIds = [...new Set(journey.stopIds)];
      journey.coordinates = journey.coordinates.filter((coord, index) => {
          return journey.coordinates.findIndex(c => c.lat === coord.lat && c.lon === coord.lon) === index;
      });

      journeys.push(journey);
  });

  return journeys;
}



export { parseSearchData, pointInPolygon, getStopsInPolygon, midpoint, parseRouteData}
