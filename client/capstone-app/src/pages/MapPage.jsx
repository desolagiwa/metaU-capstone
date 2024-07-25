import React, { useEffect, useState } from "react";
import MapWithRoute from '../components/MapWithRoute';
import "../styles/MapPage.css";
import { useLocation, useNavigate } from 'react-router-dom';
import { CircularProgress, useDisclosure, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";
import Popup from "../components/popups/Popup";

const MapPage = () => {
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showBusHereButton, setShowBusHereButton] = useState(false);
  const [showBusHereModal, setShowBusHereModal] = useState(false);
  const [busWaitTime, setBusWaitTime] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const location = useLocation();
  const { directions, data, currentCoordinates, destinationCoordinates } = location.state || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

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
    }, 5000);
    onOpen();
  }, []);

  const handleExit = () => {
    navigate('/');
  };

  const handleBusHere = () => {
    setShowBusHereModal(true);
  };

  const handleBusWaitTimeSubmit = () => {
    fetch(`http://localhost:5000/delay-trip/${data.tripIds[0]}/min`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ delayedMin: busWaitTime }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    setShowBusHereModal(false);
    setShowBusHereButton(false);
  };

  const handleDelayConfirmed = () => {
    setShowBusHereButton(true);
  };

  return (
    <>
      {directions ? (
        <div className="flex">
          <BsArrowLeftCircleFill onClick={handlePrevious} className="arrow arrow-left" />
          <div className="w-full md:w-1/2 xl:w-2/3 p-4">
            <MapWithRoute
              directions={directions}
              centerCoordinates={[currentCoordinates[1], currentCoordinates[0]]}
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
                    className={currentIndex === idx ? "indicator" : "indicator indicator-inactive"}
                    onClick={() => setCurrentIndex(idx)}
                  ></button>
                );
              })}
            </span>
            <Button onClick={handleExit}>Leave trip</Button>
            <Button onClick={() => setShowBusHereButton(true)}>Report delay</Button>
          </div>
          {showPopup && <Popup isOpen={isOpen} onOpenChange={onOpenChange} onDelayConfirmed={handleDelayConfirmed} style={{ zIndex: 10000 }} tripData={data} />}
          {showBusHereButton && <Button onClick={handleBusHere} color="secondary">My Bus is Here</Button>}
        </div>
      ) : (
        <CircularProgress label="Loading..." />
      )}

      <Modal
        isOpen={showBusHereModal}
        onOpenChange={setShowBusHereModal}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Bus Arrival Time</ModalHeader>
          <ModalBody>
            <p>How many minutes did the bus take to arrive?</p>
            <Input
              fullWidth
              value={busWaitTime}
              onChange={(e) => setBusWaitTime(e.target.value)}
              type="number"
              placeholder="Enter minutes"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setShowBusHereModal(false)}>
              Cancel
            </Button>
            <Button color="secondary" onPress={handleBusWaitTimeSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MapPage;
