import React, { useEffect, useState } from "react";
import MapWithRoute from '../components/MapWithRoute'
import "../styles/MapPage.css"
import { useParams } from "react-router-dom";
import { midpoint } from "../../utils";
import { useLocation } from 'react-router-dom';
import { CircularProgress } from "@nextui-org/react";
import { convertCoordinates } from "../../utils";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";

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

  console.log("data: ", data)

  if (!directions || !data) {
    return <div>No directions or data found</div>;
  }

  const currentCoordArray = convertCoordinates(currentCoordinates)
  const destCoordArray = convertCoordinates(destinationCoordinates)

  const handleNext = () => {
    setCurrentIndex(currentIndex === data.length - 1 ? 0 : currentIndex + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex(currentIndex === 0 ? data.length - 1 : currentIndex - 1);
  };


  return (
    <>
      {directions ? (
        <div className="flex">
          <BsArrowLeftCircleFill onClick={handlePrevious} className="arrow arrow-left" />
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
              <p key={index}>- {step.instruction}</p>
            ))}
          </div>
          <div className="flex justify-between">
            <BsArrowRightCircleFill onClick={handleNext} className="arrow arrow-right" />
            <span className="indicators">
              {directions.map((_, idx) => {
                return (
                  <button
                    key={idx}
                    className={
                      currentIndex === idx ? "indicator" : "indicator indicator-inactive"
                    }
                    onClick={() => setCurrentIndex(idx)}
                  ></button>
                );
              })}
            </span>
          </div>
        </div>
      ) : (
        <CircularProgress label="Loading..." />      )}
    </>
  )
}

export default MapPage
