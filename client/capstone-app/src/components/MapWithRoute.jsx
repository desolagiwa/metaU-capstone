import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getRandomColor } from '../../utils';

const MapWithRoute = ({ directions, centerCoordinates }) => {
  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.summary) {
      layer.bindPopup(
        `Distance: ${feature.properties.summary.distance} miles`
      );
    }

    const defaultStyle = {
      color: getRandomColor(),
      weight: 5,
    };

    const highlightStyle = {
      weight: 8,
    };

    layer.setStyle(defaultStyle);

    layer.on('mouseover', function () {
      layer.setStyle(highlightStyle);
    });

    layer.on('mouseout', function () {
      layer.setStyle(defaultStyle);
    });
  };

  return (
    <MapContainer center={centerCoordinates} zoom={13} style={{ height: '60vh', width: '100vh', zIndex: 10}}>
      <TileLayer
        url="https://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {directions.map((direction, index) => (
        <GeoJSON key={index} data={direction} onEachFeature={onEachFeature} />
      ))}
    </MapContainer>
  );
};

export default MapWithRoute;
