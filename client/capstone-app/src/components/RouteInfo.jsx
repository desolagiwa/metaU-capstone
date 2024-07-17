import React from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, RadioGroup, Radio} from "@nextui-org/react";
import { useState } from "react"
import { useNavigate, Link, useParams} from "react-router-dom";



const RouteInfo = ({data, directions, isOpen, onOpen, onOpenChange, currentCoordinates, destinationCoordinates}) => {
  const [scrollBehavior, setScrollBehavior] = useState("inside");
  const navigate = useNavigate();

  return (
        <div className="flex flex-col gap-2">

          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            scrollBehavior={scrollBehavior}
          >
           { data.transfers.length === 0 ? (
            <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  View Trip
                </ModalHeader>
                <ModalBody>
                <h2>Walk {directions[0].features[0].properties.summary.distance} miles to {data.startStopName}</h2>
                <h2>Ride {directions[1].features[0].properties.summary.distance} miles to {data.endStopName}</h2>
                <h2>Walk {directions[2].features[0].properties.summary.distance} miles to destination</h2>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                    <Button color="secondary"onClick={() => navigate(`/map/${currentCoordinates}/${destinationCoordinates}`, { state: { directions, data } })}>
                      Start Trip
                    </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
           )
           : (<ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    View Trip
                  </ModalHeader>
                  <ModalBody>
                  <h2>Walk {directions[0].features[0].properties.summary.distance} miles to {data.startStopName}</h2>
                  <h2>Ride {directions[1].features[0].properties.summary.distance} miles to {data.transfers[0].endStopName}</h2>
                  <h2>Ride {directions[2].features[0].properties.summary.distance} miles to {data.endStopName}</h2>
                  <h2>Walk {directions[2].features[0].properties.summary.distance} miles to destination</h2>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Close
                    </Button>
                      <Button color="secondary" onClick={() => navigate(`/map/${currentCoordinates}/${destinationCoordinates}`, { state: { directions, data } })}>
                        Start Trip
                      </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>)}
          </Modal>
        </div>
      );


}

export default RouteInfo
