import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapWithRoute = ({ routeData, currentRadius, destinationRadius, centerCoordinates}) => {
  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.summary) {
      layer.bindPopup(`Distance: ${feature.properties.summary.distance} meters<br>Duration: ${feature.properties.summary.duration} seconds`);
    }
  };

  return (
    <MapContainer center={centerCoordinates} zoom={15} style={{ height: '80vh', width: '100vh' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON data={routeData} onEachFeature={onEachFeature} style={{color:'blue'}}/>
    </MapContainer>
  );
};

export default MapWithRoute;
