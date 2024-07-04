import React from "react";
import { parseSearchData } from "../../utils";

const SearchResults = ({ data, setCurrentLocation, setDestination, setCurrentCoordinates, setDestinationCoordinates }) => {
  console.log(data)
  const parsedData = parseSearchData(data)

  if (setCurrentLocation) {
    return (
      <div>
        {parsedData.map((item) => (
          <div onClick={() => {setCurrentLocation(item.address); setCurrentCoordinates(item.coordinates)}}>{item.address}</div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {parsedData.map((item) => (
        <div onClick={() => {setDestination(item.address); setDestinationCoordinates(item.coordinates)}}>{item.address}</div>
      ))}
    </div>
  );
};

export default SearchResults;
