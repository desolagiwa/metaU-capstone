import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { getTimeDifference, encodeUrlParams } from "../../utils";

const RouteInfo = ({ data, directions, isOpen, onOpenChange, currentCoordinates, destinationCoordinates }) => {
  const [scrollBehavior, setScrollBehavior] = useState("inside");
  const navigate = useNavigate();

  const timeDifference = getTimeDifference(data.departureTimes, data.arrivalTimes);
  const renderInstruction = (instruction, index) => {
    const { type, distance, duration, stops, startStopName, endStopName } = instruction;

    switch (type) {
      case 'walk':
        return (
          <h2 key={index}>Walk {distance} miles to {endStopName} ({Math.floor(duration / 60)} mins)</h2>
        );
      case 'ride':
        return (
          <h2 key={index}>Ride {stops} stops to {endStopName} ({timeDifference} mins)</h2>
        );
      default:
        return null;
    }
  };

  const getInstructions = () => {
    const instructions = [];

    // Walk to the start stop
    instructions.push({
      type: 'walk',
      distance: directions[0].features[0].properties.summary.distance,
      duration: directions[0].features[0].properties.summary.duration,
      endStopName: data.startStopName,
    });

    // Ride to the end stop or transfer stops
    if (data.transfers.length === 0) {
      instructions.push({
        type: 'ride',
        stops: data.stopCoordinates.length,
        endStopName: data.endStopName,
      });
    } else {
      instructions.push({
        type: 'ride',
        stops: data.stopCoordinates.length,
        endStopName: data.transfers[0].startStopName,
      });

      instructions.push({
        type: 'ride',
        stops: data.transfers[0].stopCoordinates.length,
        endStopName: data.transfers[0].endStopName,
      });
    }

    // Walk to the final destination
    const finalWalkIndex = data.transfers.length === 0 ? 2 : 3;
    instructions.push({
      type: 'walk',
      distance: directions[finalWalkIndex].features[0].properties.summary.distance,
      duration: directions[finalWalkIndex].features[0].properties.summary.duration,
      endStopName: 'destination',
    });

    return instructions;
  };


  return (
    <div className="flex flex-col gap-2">
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior={scrollBehavior}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">View Trip</ModalHeader>
              <ModalBody>
                {getInstructions().map((instruction, index) => renderInstruction(instruction, index))}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>Close</Button>
                <Button color="secondary" onClick={() => navigate(`/map/${encodeUrlParams([currentCoordinates,destinationCoordinates])}`, { state: { directions, data, currentCoordinates, destinationCoordinates } })}>
                  Start Trip
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RouteInfo;
