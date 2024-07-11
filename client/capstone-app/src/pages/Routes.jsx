import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import RouteCard from "../components/RouteCard";
import { parseRouteData } from "../../utils";


const Routes = () => {
    const [routeOptions, setRouteOptions] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);


    function convertCoordinates(coordString) {
    return coordString.split(',').map(Number);
  }

    const {currentCoordinates, destinationCoordinates} = useParams()

  function convertCoordinates(coordString) {
      return coordString.split(',').map(Number);
    }

  const startCoordArray = convertCoordinates(currentCoordinates)
  const endCoordArray = convertCoordinates(destinationCoordinates)


  const fetchRouteOptions = async () => {
    const temp = {
      'startCoordinates': startCoordArray,
      'endCoordinates': endCoordArray
    }
    try {
      const response = await fetch("http://localhost:5000/get-routes", {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(temp)
      });
      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }
      const data = await response.json();
      console.log(data)
      setRouteOptions(data);
      setError(null);
    } catch (error) {
        console.error(error);
        setError(error.message);
    }
  }

  useEffect(() => {
  fetchRouteOptions();
  console.log(routeOptions)
  const routeData = parseRouteData(routeOptions)
  console.log("PARSED ROUTE DATA: ",routeData)
  setLoading(false);

  }, []);





  return (
    <>
      {loading ? (
      <div>Loading...</div>
      ) : (
      <div>
        {routeData && (
          routeData.map(routeOption => (
            <RouteCard
              tripId={routeOption.tripId}
              tripHeadsign={routeOption.tripHeadsign}
              routeId={routeOption.routeId}
              startStopId={routeOption.startStopId}
              endStopId={routeOption.endStopId}
              startStopLat={routeOption.startStopLat}
              startStopLon={routeOption.startStopLon}
              endStopLat={routeOption.endStopLat}
              endStopLon={routeOption.endStopLon}
            />
          ))
        )}
      </div>
    )}
    <Link to={`/map/${currentCoordinates}/${destinationCoordinates}`}>
      <button >See MAP!</button>
    </Link>
    </>
    );
}

export default Routes
