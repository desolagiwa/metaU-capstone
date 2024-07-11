import React from "react";

const RouteCard = ({tripId, tripHeadsign, routeId, startStopId, endStopId, startStopLat, startStopLon, endStopLat, endStopLon}) => {

    return (
        <>
        <div>{tripId}</div>
        <div>{tripHeadsign}</div>
        <div>{routeId}</div>
        <div>{startStopId}</div>
        <div>{endStopId}</div>
        <div>[{startStopLon}, {startStopLat}]</div>
        <div>[{endStopLon}, {endStopLat}]</div>
        </>
    )
}

export default RouteCard
