
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
