import React, { useState } from "react";
import SearchResults from "../components/SearchResults";
import { useNavigate, Link } from "react-router-dom";


const GetStarted = () => {
    const [currentLocation, setCurrentLocation] = useState("")
    const [destination, setDestination] = useState("")
    const [searchData, setSearchData] = useState(null)
    const [currentData, setCurrentData] = useState(null)
    const [destinationData, setDestinationData] = useState(null)
    const [currentCoordinates, setCurrentCoordinates] = useState(null)
    const [destinationCoordinates, setDestinationCoordinates] = useState(null)
    const [error, setError] = useState(null)
    const navigate = useNavigate()


    const handleSubmit = () => {
        console.log(currentLocation, ", ", destination)
        console.log(currentCoordinates, ", ", destinationCoordinates)
    }
    const findCurrentAddress = async (location) => {
        try {
            const response = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf6248d4d2e47b8dbe429bbfff21f28b793179&text=${location}&boundary.country=USA`, {
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
            const response = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf6248d4d2e47b8dbe429bbfff21f28b793179&text=${location}&boundary.country=USA`, {
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




    return (
        <>
            <h2>Where are you? </h2>
            <input placeholder="Enter current address... " type="text" value={currentLocation} onChange={handleCurrentLocationChange} required/>
            {currentLocation && <SearchResults data={currentData} setCurrentLocation={setCurrentLocation} currentLocation={currentLocation} setCurrentCoordinates={setCurrentCoordinates} setCurrentData={setCurrentData}/>}
            <h2>Where do you want to go?</h2>
            <input  placeholder="Enter desired destinstion... " type="text" value={destination} onChange={handleDestinationChange} required/>
            {destination && <SearchResults data={destinationData} setDestination={setDestination} destination={destination} setDestinationCoordinates={setDestinationCoordinates} setDestinationData={setDestinationData}/>}
            <Link to={`/route-options/${currentCoordinates}/${destinationCoordinates}`}>
            <button onClick={handleSubmit}>Let's Go!</button>
            </Link>

        </>
    )
}

export default GetStarted
