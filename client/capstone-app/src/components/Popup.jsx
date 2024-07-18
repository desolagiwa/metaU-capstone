import React from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, RadioGroup, Radio} from "@nextui-org/react";


const Popup = ({isOpen, onOpenChange}) => {

    return (
        <>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true} backdrop="blur">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Have you started your trip?</ModalHeader>
                <ModalBody>
                <RadioGroup
                color="secondary"
                >
                <Radio >
                    Yes
                </Radio>
                <Radio description="I changed my mind">
                    No
                </Radio>
                <Radio description="My bus is late">
                    No
                </Radio>
                </RadioGroup>
                </ModalBody>
                <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="secondary" onPress={onClose}>
                  Continue
                </Button>
              </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )
}

export default Popup
