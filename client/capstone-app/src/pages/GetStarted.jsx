import React, { useState } from "react";
import SearchResults from "../components/SearchResults";
import { useNavigate, Link } from "react-router-dom";
import { Input, Button, Switch } from "@nextui-org/react";
import dotenv from "dotenv"



const GetStarted = () => {
    const [currentLocation, setCurrentLocation] = useState("")
    const [destination, setDestination] = useState("")
    const [searchData, setSearchData] = useState(null)
    const [currentData, setCurrentData] = useState(null)
    const [destinationData, setDestinationData] = useState(null)
    const [currentCoordinates, setCurrentCoordinates] = useState(null)
    const [destinationCoordinates, setDestinationCoordinates] = useState(null)
    const [maxTransfers, setMaxTransfers] = useState(0)
    const [walkingTransfers, setWalkingTransfers] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const apiKey = import.meta.env.VITE_MAP_API_KEY


    const findCurrentAddress = async (location) => {
        try {
            const response = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${location}&boundary.country=USA`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
              },
            });
            const data = await response.json();
            setCurrentData(data)
          } catch (error) {
            console.error(error);
          }
    }
    const findDestinationAddress = async (location) => {
        try {
            const response = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${location}&boundary.country=USA`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
              },
            });
            const data = await response.json();
            setDestinationData(data)
          } catch (error) {
            console.error(error);
          }
    }

    const handleCurrentLocationChange = (event) => {
        setCurrentLocation(event.target.value)
        findCurrentAddress(currentLocation)
    }

    const handleDestinationChange = (event) => {
        setDestination(event.target.value)
        findDestinationAddress(destination)
    }

    const navigateToRoutes = () => {
      navigate(`/route-options/${currentCoordinates}/${destinationCoordinates}`, {
        state: { walkingTransfers, maxTransfers }
      });
    };

    return (
      <>
          <h2>Where are you? </h2>
          <div>
            <input placeholder="Enter current address... " type="text" value={currentLocation} onChange={handleCurrentLocationChange} required/>
            {currentLocation && <SearchResults data={currentData} setCurrentLocation={setCurrentLocation} currentLocation={currentLocation} setCurrentCoordinates={setCurrentCoordinates} setCurrentData={setCurrentData}/>}
          </div>
          <h2>Where do you want to go?</h2>
          <div>
            <input  placeholder="Enter desired destinstion... " type="text" value={destination} onChange={handleDestinationChange} required/>
            {destination && <SearchResults data={destinationData} setDestination={setDestination} destination={destination} setDestinationCoordinates={setDestinationCoordinates} setDestinationData={setDestinationData}/>}
          </div>
          <Input
            fullWidth
            value={maxTransfers}
            onChange={(e) => setMaxTransfers(e.target.value)}
            type="number"
            placeholder="Enter number of transfers"
          />
          <div>
            <Switch color="secondary" onClick={()=>{setWalkingTransfers(!walkingTransfers)}}>Include walking transfers</Switch>
          </div>
          <Button onPress={()=>{navigateToRoutes()}}>Let's Go!</Button>

      </>
  )
}

export default GetStarted
