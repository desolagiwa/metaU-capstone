import React, { useEffect, useState } from "react";
import MapWithRoute from '../components/MapWithRoute'
import { useParams } from "react-router-dom";
import { midpoint } from "../../utils";
import { useLocation } from 'react-router-dom';
import { Progress } from "@nextui-org/react";
import { convertCoordinates } from "../../utils";

const MapPage = () => {
  const [currentRadius, setCurrentRadius] = useState(null)
  const [destinationRadius, setDestinationRadius] = useState(null)
  const {currentCoordinates, destinationCoordinates} = useParams()
  const [error, setError] = useState(null)
  const accept = 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
  const contentType = 'application/json; charset=utf-8'

  const location = useLocation();
  const { directions, data } = location.state || {};
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!directions || !data) {
    return <div>No directions or data found</div>;
  }

  const currentCoordArray = convertCoordinates(currentCoordinates)
  const destCoordArray = convertCoordinates(destinationCoordinates)

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex(currentIndex - 1);
  };


  return (
    <>
      {directions ? (
        <div className="flex">
          <button onClick={handlePrevious} disabled={currentIndex === 0}>
              Previous
            </button>
          <div className="w-full md:w-1/2 xl:w-2/3 p-4">
            <MapWithRoute
              directions={directions}
              centerCoordinates={currentCoordArray}
              routeData={data}
            />
          </div>
          <div className="w-full md:w-1/2 xl:w-1/3 p-4">
            <h2>Instructions</h2>
            {directions[currentIndex].features[0].properties.segments[0].steps.map((step, index) => (
              <p key={index}>{step.instruction}</p>
            ))}
          </div>
          <div className="flex justify-between">

            <button onClick={handleNext} disabled={currentIndex === directions.length - 1}>
              Next
            </button>
          </div>
        </div>
      ) : (
        <Progress size="lg" isIndeterminate aria-label="Loading..." className="max-w-md" />
      )}
    </>
  )
}

export default MapPage
