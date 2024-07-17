import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMap } from 'react-leaflet'
import { useEffect } from 'react';
import { getRandomColor } from '../../utils';



const MapWithRoute = ({ routeData, directions, centerCoordinates}) => {
  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.summary) {
      layer.bindPopup(`Distance: ${feature.properties.summary.distance} meters<br>Duration: ${feature.properties.summary.duration} seconds`);
    }
  };

  return (
    <MapContainer center={centerCoordinates} zoom={13} style={{ height: '60vh', width: '100vh' }}>
      <TileLayer
        url="https://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {directions.map((direction, index) => {
        const color = getRandomColor();

        return (
          <GeoJSON
            key={index}
            data={direction}
            onEachFeature={onEachFeature}
            style={{
              color: color,
              weight: 5,
            }}
          />
        );
      })}
    </MapContainer>
  );
};

export default MapWithRoute;
