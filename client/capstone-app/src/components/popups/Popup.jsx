// import React, { useState } from "react";
// import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, RadioGroup, Radio } from "@nextui-org/react";
// import { useNavigate } from "react-router-dom";

// const Popup = ({ isOpen, onOpenChange, tripData, onDelayConfirmed }) => {
//   const navigate = useNavigate();
//   const [action, setAction] = useState("");
//   const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);
//   const [showReportConfirmation, setShowReportConfirmation] = useState(false);
//   const [showBusSelection, setShowBusSelection] = useState(false);
//   const [showDelayOptions, setShowDelayOptions] = useState(false);
//   const [selectedBus, setSelectedBus] = useState("");

//   const handleContinue = () => {
//     if (action === "change-trip") {
//       setShowChangeConfirmation(true);
//     } else if (action === "delay-trip") {
//       setShowReportConfirmation(true);
//     } else {
//       handleAction();
//     }
//   };

//   const handleAction = () => {
//     switch (action) {
//       case "continue":
//         onOpenChange(false);
//         break;
//       case "change-trip":
//         navigate("/change-trip");
//         break;
//       case "delay-trip":
//         setShowReportConfirmation(false);
//         setShowBusSelection(true);
//         break;
//       default:
//         console.log("Unknown selection");
//     }
//     setShowChangeConfirmation(false);
//   };

//   const handleConfirmation = (confirm) => {
//     if (confirm) {
//       handleAction();
//     } else {
//       setShowChangeConfirmation(false);
//       setShowReportConfirmation(false);
//     }
//   };

//   const handleBusSelectionChange = (bus) => {
//     setSelectedBus(bus);
//   };

//   const handleReport = () => {
//     fetch(`http://localhost:5000/delay-trip/${selectedBus}/report`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ isDelayed: true }),
//     })
//       .then(response => response.json())
//       .then(data => {
//         console.log('Success:', data);
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//       });

//     setShowBusSelection(false);
//     setShowDelayOptions(true);
//   };

//   const renderBusOptions = () => {
//     const busOptions = [];

//     // Add the main trip bus
//     busOptions.push(
//       <Radio value={tripData.tripId}>
//         {tripData.routeId}: {tripData.tripHeadsign}
//       </Radio>
//     );

//     // Add transfer buses
//     if (tripData.transfers && tripData.transfers.length > 0) {
//       tripData.transfers.forEach((transfer) => {
//         busOptions.push(
//           <Radio value={transfer.tripId}>
//             {transfer.routeId}: {transfer.tripHeadsign}
//           </Radio>
//         );
//       });
//     }

//     return busOptions;
//   };

//   const handleDelayOption = (option) => {
//     if (option === 'leave') {
//       navigate("/map");
//     } else {
//       onDelayConfirmed();
//       setShowDelayOptions(false);
//     }
//   };

//   return (
//     <>
//       <Modal
//         isOpen={isOpen}
//         onOpenChange={onOpenChange}
//         isDismissable={false}
//         isKeyboardDismissDisabled={true}
//         backdrop="blur"
//       >
//         <ModalContent>
//           {(onClose) => (
//             <>
//               <ModalHeader className="flex flex-col gap-1">Have you started your trip?</ModalHeader>
//               <ModalBody>
//                 <RadioGroup color="secondary" onChange={(e) => setAction(e.target.value)}>
//                   <Radio value="continue">Yes</Radio>
//                   <Radio value="change-trip" description="I want to change my trip">No</Radio>
//                   <Radio value="delay-trip" description="My bus is late">No</Radio>
//                 </RadioGroup>
//               </ModalBody>
//               <ModalFooter>
//                 <Button color="danger" variant="light" onPress={() => onOpenChange(false)}>
//                   Close
//                 </Button>
//                 <Button color="secondary" onPress={handleContinue}>
//                   Continue
//                 </Button>
//               </ModalFooter>
//             </>
//           )}
//         </ModalContent>
//       </Modal>

//       <Modal
//         isOpen={showChangeConfirmation}
//         onOpenChange={setShowChangeConfirmation}
//         isDismissable={false}
//         isKeyboardDismissDisabled={true}
//         backdrop="blur"
//       >
//         <ModalContent>
//           <ModalHeader className="flex flex-col gap-1">Are you sure?</ModalHeader>
//           <ModalBody>
//             <p>Do you really want to change your trip?</p>
//           </ModalBody>
//           <ModalFooter>
//             <Button color="danger" variant="light" onPress={() => handleConfirmation(false)}>
//               No
//             </Button>
//             <Button color="secondary" onPress={() => handleConfirmation(true)}>
//               Yes
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       <Modal
//         isOpen={showReportConfirmation}
//         onOpenChange={setShowReportConfirmation}
//         isDismissable={false}
//         isKeyboardDismissDisabled={true}
//         backdrop="blur"
//       >
//         <ModalContent>
//           <ModalHeader className="flex flex-col gap-1">Are you sure?</ModalHeader>
//           <ModalBody>
//             <p>Do you want to report a delayed bus?</p>
//           </ModalBody>
//           <ModalFooter>
//             <Button color="danger" variant="light" onPress={() => handleConfirmation(false)}>
//               No
//             </Button>
//             <Button color="secondary" onPress={() => handleConfirmation(true)}>
//               Yes
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       <Modal
//         isOpen={showBusSelection}
//         onOpenChange={setShowBusSelection}
//         isDismissable={false}
//         isKeyboardDismissDisabled={true}
//         backdrop="blur"
//       >
//         <ModalContent>
//           <ModalHeader className="flex flex-col gap-1">Select Bus</ModalHeader>
//           <ModalBody>
//             <RadioGroup color="secondary" onChange={(e) => handleBusSelectionChange(e.target.value)}>
//               {renderBusOptions()}
//             </RadioGroup>
//           </ModalBody>
//           <ModalFooter>
//             <Button color="danger" variant="light" onPress={() => setShowBusSelection(false)}>
//               Cancel
//             </Button>
//             <Button color="secondary" onPress={handleReport}>
//               Report
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       <Modal
//         isOpen={showDelayOptions}
//         onOpenChange={setShowDelayOptions}
//         isDismissable={false}
//         isKeyboardDismissDisabled={true}
//         backdrop="blur"
//       >
//         <ModalContent>
//           <ModalHeader className="flex flex-col gap-1">Bus Delay Reported</ModalHeader>
//           <ModalBody>
//             <p>The bus has been reported as delayed. Do you want to stay and wait or leave the trip?</p>
//           </ModalBody>
//           <ModalFooter>
//             <Button color="danger" variant="light" onPress={() => handleDelayOption('leave')}>
//               Leave Trip
//             </Button>
//             <Button color="secondary" onPress={() => handleDelayOption('wait')}>
//               Stay and Wait
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// export default Popup;



import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, RadioGroup, Radio } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

const Popup = ({ isOpen, onOpenChange, tripData, onDelayConfirmed }) => {
  const navigate = useNavigate();
  const [action, setAction] = useState("");
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);
  const [showBusSelection, setShowBusSelection] = useState(false);
  const [showDelayOptions, setShowDelayOptions] = useState(false);
  const [selectedBus, setSelectedBus] = useState("");
  const [warning, setWarning] = useState("");
  const [busWarning, setBusWarning] = useState("");

  const handleContinue = () => {
    if (!action) {
      setWarning("Please select an option before continuing.");
      return;
    }

    setWarning("");
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
        break;
      case "change-trip":
        navigate("/change-trip");
        break;
      case "delay-trip":
        setShowReportConfirmation(false);
        setShowBusSelection(true);
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

  const handleBusSelectionChange = (bus) => {
    setSelectedBus(bus);
  };

  const handleReport = () => {
    if (!selectedBus) {
      setBusWarning("Please select a bus before reporting.");
      return;
    }
    setBusWarning("");
    fetch(`http://localhost:5000/delay-trip/${selectedBus}/report`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isDelayed: true }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    setShowBusSelection(false);
    setShowDelayOptions(true);
  };

  const renderBusOptions = () => {
    const busOptions = [];

    // Add the main trip bus
    busOptions.push(
      <Radio value={tripData.tripId} key={tripData.tripId}>
        {tripData.routeId}: {tripData.tripHeadsign}
      </Radio>
    );

    // Add transfer buses
    if (tripData.transfers && tripData.transfers.length > 0) {
      tripData.transfers.forEach((transfer) => {
        busOptions.push(
          <Radio value={transfer.tripId} key={transfer.tripId}>
            {transfer.routeId}: {transfer.tripHeadsign}
          </Radio>
        );
      });
    }

    return busOptions;
  };

  const handleDelayOption = (option) => {
    if (option === 'leave') {
      navigate("/map");
    } else {
      onDelayConfirmed();
      setShowDelayOptions(false);
    }
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
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Have you started your trip?</ModalHeader>
              <ModalBody>
                <RadioGroup color="secondary" onChange={(e) => setAction(e.target.value)}>
                  <Radio value="continue">Yes</Radio>
                  <Radio value="change-trip" description="I want to change my trip">No</Radio>
                  <Radio value="delay-trip" description="My bus is late">No</Radio>
                </RadioGroup>
                {warning && <p style={{ color: 'red' }}>{warning}</p>}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button color="secondary" onPress={handleContinue}>
                  Continue
                </Button>
              </ModalFooter>
            </>
          )}
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
            <RadioGroup color="secondary" onChange={(e) => handleBusSelectionChange(e.target.value)}>
              {renderBusOptions()}
            </RadioGroup>
            {busWarning && <p style={{ color: 'red' }}>{busWarning}</p>}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setShowBusSelection(false)}>
              Cancel
            </Button>
            <Button color="secondary" onPress={handleReport}>
              Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showDelayOptions}
        onOpenChange={setShowDelayOptions}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Bus Delay Reported</ModalHeader>
          <ModalBody>
            <p>The bus has been reported as delayed. Do you want to stay and wait or leave the trip?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => handleDelayOption('leave')}>
              Leave Trip
            </Button>
            <Button color="secondary" onPress={() => handleDelayOption('wait')}>
              Stay and Wait
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Popup;
