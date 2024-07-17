import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import RouteCard from "../components/RouteCard";
import { parseRouteData, convertCoordinates } from "../../utils";
import { Progress } from "@nextui-org/react";


const Routes = () => {
    const [routeOptions, setRouteOptions] = useState(null);
    const [routeData, setRouteData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentCoordinates, destinationCoordinates } = useParams();

    const startCoordArray = convertCoordinates(currentCoordinates);
    const endCoordArray = convertCoordinates(destinationCoordinates);

    const fetchRouteOptions = async () => {
        const temp = {
            'startCoordinates': startCoordArray,
            'endCoordinates': endCoordArray
        };
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
            setRouteOptions(data);
            const parsedData = parseRouteData(data);
            setRouteData(parsedData);
            setError(null);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRouteOptions();
        console.log(routeData)
    }, [currentCoordinates, destinationCoordinates]);

    return (
        <>
            {loading ? (
              <Progress
              size="lg"
              isIndeterminate
              aria-label="Loading..."
              className="max-w-md"
              />
              ) : error ? (
                <div>Error: {error}</div>
            ) : (
                <div>
                  <h1>TRIP OPTIONS:</h1>
                    {routeData && routeData.map(routeOption => (
                        <RouteCard
                            tripIds={routeOption.tripIds}
                            tripHeadsign={routeOption.tripHeadsign}
                            routeId={routeOption.routeId}
                            startStopId={routeOption.startStopId}
                            endStopId={routeOption.endStopId}
                            startStopName={routeOption.startStopName}
                            endStopName={routeOption.endStopName}
                            startStopCoordinates={routeOption.startStopCoordinates}
                            endStopCoordinates={routeOption.endStopCoordinates}
                            transfers = {routeOption.transfers}
                            data = {routeOption}
                            currentCoordinates = {startCoordArray}
                            destinationCoordinates = {endCoordArray}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

export default Routes;
