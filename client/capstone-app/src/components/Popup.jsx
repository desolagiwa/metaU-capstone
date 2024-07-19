import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, RadioGroup, Radio } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

const Popup = ({ isOpen, onOpenChange }) => {
  const navigate = useNavigate();
  const [action, setAction] = useState("");

  const handleContinue = () => {
    switch (action) {
      case "continue":
        onOpenChange(false)
        console.log("Yes!");
        break;
      case "change-trip":
        console.log("Change trip");
        navigate("/change-trip");
        break;
      case "delay-trip":
        console.log("Bus late!");
        break;
      default:
        console.log("Unknown selection");
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true} backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Have you started your trip?</ModalHeader>
        <ModalBody>
          <RadioGroup color="secondary" onChange={(e) => {setAction(e.target.value)}}>
            <Radio value="continue">
              Yes
            </Radio>
            <Radio value="change-trip" description="I want to change my trip">
              No
            </Radio>
            <Radio value="delay-trip" description="My bus is late">
              No
            </Radio>
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
  );
};

export default Popup;
