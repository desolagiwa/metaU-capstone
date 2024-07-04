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
    <MapContainer center={[0,0]} zoom={15} style={{ height: '80vh', width: '100vh' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[-90.086568, 29.956042]} />
      <Marker position={[-90.107371, 29.963998]} />
      <GeoJSON data={currentRadius} onEachFeature={onEachFeature} style={{color:'green'}}/>
      <GeoJSON data={destinationRadius} onEachFeature={onEachFeature} style={{color:'purple'}}/>
      <GeoJSON data={routeData} onEachFeature={onEachFeature} style={{color:'blue'}}/>

    </MapContainer>
  );
};

export default MapWithRoute;
