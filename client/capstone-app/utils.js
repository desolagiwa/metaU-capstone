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
  const x = point[0];
  const y = point[1];
  const vertices = polygon.coordinates[0];
  let inside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0];
    const yi = vertices[i][1];
    const xj = vertices[j][0];
    const yj = vertices[j][1];

    if ((yi <= y && y < yj) || (yj <= y && y < yi)) {
      const slope = (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (x < slope) {
        inside = !inside;
      }
    }
  }

  return inside;
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

export { parseSearchData, pointInPolygon, getStopsInPolygon}
