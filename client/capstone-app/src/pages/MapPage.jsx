import React, { useEffect, useState } from "react";
import MapWithRoute from '../components/MapWithRoute'
import { useParams } from "react-router-dom";


const MapPage = () => {
    const [directions, setDirections] = useState(null)
    const [currentRadius, setCurrentRadius] = useState(null)
    const [destinationRadius, setDestinationRadius] = useState(null)
    const {currentCoordinates, destinationCoordinates} = useParams()
    const [error, setError] = useState(null)

    function convertCoordinates(coordString) {
      return coordString.split(',').map(Number);
    }

    const fetchDirections = async () => {
        try {
        const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248d2ab3de842a1474a865cff3fff2e2787&start=${currentCoordinates}&end=${destinationCoordinates}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
          },
        });
        const data = await response.json();
        setDirections(data)
      } catch (error) {
        console.error(error);
      }
    }

    const currentCoordArray = convertCoordinates(currentCoordinates)
    const destCoordArray = convertCoordinates(destinationCoordinates)

  const fetchCurrentRadius = async () => {
    try {
      const response = await fetch('https://api.openrouteservice.org/v2/isochrones/foot-walking', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Authorization': '5b3ce3597851110001cf6248d2ab3de842a1474a865cff3fff2e2787',
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        locations: [currentCoordArray],
        range: [0, 1],
        location_type: 'start',
        range_type: 'distance',
        units: 'mi'
      })
    })
      console.log('Status:', response.status);
      const data =  await response.json();
      setCurrentRadius(data)
    }
    catch(error) {
      console.error('Error:', error);
    };
  }

    const fetchDestinationRadius = async () => {
      try {
        const response = await fetch('https://api.openrouteservice.org/v2/isochrones/foot-walking', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Authorization': '5b3ce3597851110001cf6248d2ab3de842a1474a865cff3fff2e2787',
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          locations: [destCoordArray],
          range: [0, 1],
          location_type: 'start',
          range_type: 'distance',
          units: 'mi'
        })
      })
        console.log('Status:', response.status);
        const data =  await response.json();
        setDestinationRadius(data)
      }
      catch(error) {
        console.error('Error:', error);
      };
    }






    useEffect(() => {
        fetchDirections();
        fetchCurrentRadius()
        fetchDestinationRadius()
      }, []);


      function midpoint(coord1, coord2) {
        const [lat1, lon1] = coord1.map(radians);
        const [lat2, lon2] = coord2.map(radians);

        const sumX = Math.cos(lat1) * Math.cos(lon1) + Math.cos(lat2) * Math.cos(lon2);
        const sumY = Math.cos(lat1) * Math.sin(lon1) + Math.cos(lat2) * Math.sin(lon2);
        const sumZ = Math.sin(lat1) + Math.sin(lat2);

        const avgX = sumX / 2;
        const avgY = sumY / 2;
        const avgZ = sumZ / 2;

        const lon = Math.atan2(avgY, avgX);
        const hyp = Math.sqrt(avgX * avgX + avgY * avgY);
        const lat = Math.atan2(avgZ, hyp);

        return [degrees(lat), degrees(lon)];

        function radians(n) {
          return n * Math.PI / 180;
        }

        function degrees(n) {
          return n * 180 / Math.PI;
        }
      }

      const centerCoordinates = midpoint(currentCoordArray,destCoordArray)


    return (
        <div>
            <div>MAP PAGE</div>
            {directions && <MapWithRoute routeData = {directions} currentRadius={currentRadius} destinationRadius={destinationRadius} centerCoordinates={centerCoordinates}/>}
        </div>
    )
}


export default MapPage
