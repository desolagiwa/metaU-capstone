import React, { useEffect, useState } from "react";
import MapWithRoute from '../components/MapWithRoute'
import "../styles/MapPage.css"
import { midpoint } from "../../utils";
import { useLocation, useNavigate } from 'react-router-dom';
import { CircularProgress, useDisclosure, Button} from "@nextui-org/react";
import { convertCoordinates } from "../../utils";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";
import Popup from "../components/Popup";

const MapPage = () => {
  const [error, setError] = useState(null)
  const [showPopup, setShowPopup] = useState(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const location = useLocation();
  const { directions, data, currentCoordinates, destinationCoordinates } = location.state || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate()


  if (!directions || !data) {
    return <div>No directions or data found</div>;
  }

  const handleNext = () => {
    setCurrentIndex(currentIndex === data.length - 1 ? 0 : currentIndex + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex(currentIndex === 0 ? data.length - 1 : currentIndex - 1);
  };

  useEffect(() => {
    setTimeout(() => {
      setShowPopup(true);
    }, 5000)
    onOpen()
  }, []);

  const handleExit = () => {
    navigate('/')
  }

  return (
    <>
      {directions ? (
        <div className="flex">
          <BsArrowLeftCircleFill onClick={handlePrevious} className="arrow arrow-left" />
          <div className="w-full md:w-1/2 xl:w-2/3 p-4">
            <MapWithRoute
              directions={directions}
              centerCoordinates={[currentCoordinates[1],currentCoordinates[0]]}
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
            <Button onClick={handleExit}>Leave trip</Button>
            <Button>Report delay</Button>
          </div>
          {showPopup && <Popup isOpen={isOpen} onOpenChange={onOpenChange}  style={{ zIndex: 10000 }} tripData={data}/>}

        </div>
      ) : (
        <CircularProgress label="Loading..." />      )}

    </>
  )
}

export default MapPage
