import React from "react";
import { parseSearchData } from "../../utils";
import {Listbox, ListboxItem} from "@nextui-org/react";
import { useState } from "react";

const SearchResults = ({ data, setCurrentLocation, setDestination, setCurrentCoordinates, setDestinationCoordinates, setCurrentData, setDestinationData }) => {
  console.log(data)
  let parsedData = parseSearchData(data)
  const [selectedVariant, setSelectedVariant] = useState("bordered")
  const [selectedColor, setSelectedColor] = useState("secondary")

  if (setCurrentLocation) {
    return (
      <div className="flex flex-col gap-4">
        <Listbox
            aria-label="Listbox Variants"
            color={selectedColor}
            variant={selectedVariant}>

            {parsedData.map((item) => (
              <ListboxItem onClick={() => {setCurrentLocation(item.address); setCurrentCoordinates(item.coordinates)}}>{item.address}</ListboxItem>
            ))}
          </Listbox>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Listbox
          aria-label="Listbox Variants"
          color={selectedColor}
          variant={selectedVariant}>

          {parsedData.map((item) => (
            <ListboxItem onClick={() => {setDestination(item.address); setDestinationCoordinates(item.coordinates)}}>{item.address}</ListboxItem>
          ))}
        </Listbox>
    </div>
  );
}
export default SearchResults
