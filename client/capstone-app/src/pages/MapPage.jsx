import React, { useEffect, useState } from "react";
import MapWithRoute from '../components/MapWithRoute'
import { useParams } from "react-router-dom";
import {BounceLoader} from 'react-spinners'
import { midpoint } from "../../utils";
import dotenv from "dotenv"


const MapPage = () => {
  const [directions, setDirections] = useState(null)
  const [currentRadius, setCurrentRadius] = useState(null)
  const [destinationRadius, setDestinationRadius] = useState(null)
  const {currentCoordinates, destinationCoordinates} = useParams()
  const [error, setError] = useState(null)
  const apiKey = import.meta.env.VITE_MAP_API_KEY
  const accept = 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
  const contentType = 'application/json; charset=utf-8'

  function convertCoordinates(coordString) {
    return coordString.split(',').map(Number);
  }

  const fetchDirections = async () => {
    try {
      const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${currentCoordinates}&end=${destinationCoordinates}`, {
        method: 'GET',
        headers: {
          'Accept': accept
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
        'Accept': accept,
        'Authorization': apiKey,
        'Content-Type': contentType
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
          'Accept': accept,
          'Authorization': apiKey,
          'Content-Type': contentType
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

  const centerCoordinates = midpoint(currentCoordArray,destCoordArray)

  return (
    <>
      <div>MAP PAGE</div>
      {directions ? (
        <MapWithRoute
          routeData={directions}
          currentRadius={currentRadius}
          destinationRadius={destinationRadius}
          centerCoordinates={centerCoordinates}
        />
      ) : (
        <BounceLoader />
      )}
    </>
  )
}


export default MapPage
