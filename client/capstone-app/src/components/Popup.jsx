import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, RadioGroup, Radio } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

const Popup = ({ isOpen, onOpenChange }) => {
  const navigate = useNavigate();
  const [action, setAction] = useState("");
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);
  const [showBusSelection, setShowBusSelection] = useState(false);

  const handleContinue = () => {
    if (action === "change-trip") {
      setShowChangeConfirmation(true);
    } else if (action === "delay-trip") {
      setShowReportConfirmation(true);
    } else {
      handleAction();
    }
  };

  const handleAction = () => {
    switch (action) {
      case "continue":
        onOpenChange(false);
        console.log("Yes!");
        break;
      case "change-trip":
        console.log("Change trip");
        navigate("/change-trip");
        break;
      case "delay-trip":
        setShowReportConfirmation(false);
        setShowBusSelection(true);
        console.log("Bus late!");
        break;
      default:
        console.log("Unknown selection");
    }

    setShowChangeConfirmation(false);
  };

  const handleConfirmation = (confirm) => {
    if (confirm) {
      handleAction();
    } else {
      setShowChangeConfirmation(false);
      setShowReportConfirmation(false);
    }
  };

  const handleBusSelection = (bus) => {
    console.log(`Bus selected: ${bus}`);
    setShowBusSelection(false);
    onOpenChange(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Have you started your trip?</ModalHeader>
          <ModalBody>
            <RadioGroup color="secondary" onChange={(e) => setAction(e.target.value)}>
              <Radio value="continue">Yes</Radio>
              <Radio value="change-trip" description="I want to change my trip">No</Radio>
              <Radio value="delay-trip" description="My bus is late">No</Radio>
            </RadioGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => onOpenChange(false)}>
              Close
            </Button>
            <Button color="secondary" onPress={handleContinue}>
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showChangeConfirmation}
        onOpenChange={setShowChangeConfirmation}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Are you sure?</ModalHeader>
          <ModalBody>
            <p>Do you really want to change your trip?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => handleConfirmation(false)}>
              No
            </Button>
            <Button color="secondary" onPress={() => handleConfirmation(true)}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showReportConfirmation}
        onOpenChange={setShowReportConfirmation}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Are you sure?</ModalHeader>
          <ModalBody>
            <p>Do you want to report a delayed bus?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => handleConfirmation(false)}>
              No
            </Button>
            <Button color="secondary" onPress={() => handleConfirmation(true)}>
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showBusSelection}
        onOpenChange={setShowBusSelection}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Select Bus</ModalHeader>
          <ModalBody>
            <RadioGroup color="secondary" onChange={(e) => handleBusSelection(e.target.value)}>
              <Radio value="bus-1">Bus 1</Radio>
              <Radio value="bus-2">Bus 2</Radio>
              <Radio value="bus-3">Bus 3</Radio>
            </RadioGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setShowBusSelection(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Popup;
