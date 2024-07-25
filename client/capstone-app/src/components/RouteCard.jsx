import React from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";
import RouteInfo from "./RouteInfo";
import dotenv from "dotenv"
import { useState, useEffect } from "react";



const RouteCard =  ({tripIds, tripHeadsign, routeId, startStopId, endStopId, startStopCoordinates, startStopName, endStopName, endStopCoordinates, transfers, data, currentCoordinates, destinationCoordinates, stopCoordinates}) => {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [tripDetails, setTripDetails] = useState(null)
    const apiKey = import.meta.env.VITE_MAP_API_KEY


    const fetchWalkingDirections = async (startCoordinates, endCoordinates) => {
        const url = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson'
        try {
            const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                coordinates: [startCoordinates, endCoordinates],
                units: 'mi'
            }),
            headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Authorization': apiKey,
                'Content-Type': 'application/json; charset=utf-8'
            }
            });
            const data = await response.json();
            console.log('Status:', response.status);
            return data;
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDrivingDirections = async (stopCoordinates) => {
        function parseStopCoordinates(stopCoordinates) {
            return stopCoordinates.map(stop => stop.coordinates);
          }

          const coordinates = parseStopCoordinates(stopCoordinates)
        const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
        try {
            const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                coordinates: coordinates,
                units: 'mi'
            }),
            headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Authorization': apiKey,
                'Content-Type': 'application/json; charset=utf-8'
            }
            });
            const data = await response.json();
            console.log('Status:', response.status);
            return data;
        } catch (error) {
            console.error(error);
        }
    };

    const getTripDetails = async () => {
        const tripDetails = []
        if (transfers.length === 0){
            const initialWalkingRoute = await fetchWalkingDirections(currentCoordinates, startStopCoordinates)
            const firstDrivingRoute = await fetchDrivingDirections(stopCoordinates)
            const finalWalkingRoute = await fetchWalkingDirections(endStopCoordinates, destinationCoordinates)
            tripDetails.push(initialWalkingRoute)
            tripDetails.push(firstDrivingRoute)
            tripDetails.push(finalWalkingRoute)
        } else {
            const initialWalkingRoute = await fetchWalkingDirections(currentCoordinates, startStopCoordinates)
            const firstDrivingRoute = await fetchDrivingDirections(stopCoordinates)
            const secondDrivingRoute = await fetchDrivingDirections(transfers[0].stopCoordinates)
            const finalWalkingRoute = await fetchWalkingDirections(transfers[0].endStopCoordinates, destinationCoordinates)
            tripDetails.push(initialWalkingRoute)
            tripDetails.push(firstDrivingRoute)
            tripDetails.push(secondDrivingRoute)
            tripDetails.push(finalWalkingRoute)
        }
        setTripDetails(tripDetails)
    }

    useEffect(() => {
       getTripDetails()
    }, []);


    return (
        <>
       { transfers.length > 0 ?
       (<div>
            <div>{tripHeadsign} --- {transfers[0].tripHeadsign}</div>
            <div>{routeId} --- {transfers[0].routeId}</div>
            {data.isDelayed === true || transfers[0].isDelayed === true &&
            <p style={{color: "red"}}>Late!</p>}
            <Button onPress={onOpen} isOpen={isOpen} onOpenChange={onOpenChange}>See Trip Details</Button>
            <RouteInfo directions={tripDetails} isOpen={isOpen} onOpenChange={onOpenChange} data = {data} currentCoordinates={currentCoordinates} destinationCoordinates={destinationCoordinates}/>
       </div>):
       (<div>
            <div>{tripHeadsign}</div>
            <div>{routeId}</div>
            {data.isDelayed === true &&
            <p style={{color: "red"}}>Late!</p>}
            <Button onPress={onOpen}>See Trip Details</Button>
            <RouteInfo directions={tripDetails} isOpen={isOpen} onOpenChange={onOpenChange} data = {data} currentCoordinates={currentCoordinates} destinationCoordinates={destinationCoordinates}/>
        </div>)
        }
        </>
    )
}

export default RouteCard
