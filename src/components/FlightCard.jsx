import { TbPlaneOff, TbPlane } from 'react-icons/tb';
import { BsSpeedometer2 } from 'react-icons/bs';
import { RiPinDistanceLine } from 'react-icons/ri';
import { CircleFlag } from 'react-circle-flags';
import { motion } from 'framer-motion';
import {useEffect, useRef} from "react";

export default function FlightCard({ flight, expandedFlightCallsign, setExpandedFlightCallsign, openMapPopup }) {
    const isExpanded = expandedFlightCallsign === flight.callsign;
    const countryNameRef = useRef(null);

    const toggleExpanded = () => {
        setExpandedFlightCallsign(isExpanded ? null : flight.callsign);
    };

    useEffect(() => {
        const countryNameElement = countryNameRef.current;
        if (countryNameElement.scrollWidth > countryNameElement.clientWidth) {
            countryNameElement.classList.add('overflowing');
        } else {
            countryNameElement.classList.remove('overflowing');
        }
    }, [flight.countryName]);

    const updatedStatus = flight.progressPercentage > 99 ? 'arrived' : flight.status;

    return (
        <div className="flight-card">
            <div className="flight-summary" onClick={toggleExpanded}>
                <ul id="flight-info">
                    <li id="callsign">
                        {updatedStatus === 'en-route' ? (
                            <TbPlane className="icon" color="green" size="20px"/>
                        ) : (
                            <TbPlaneOff className="icon" color="red" size="20px"/>
                        )}{' '}
                        {flight.callsign}
                    </li>
                    <li id="origin">
                        <CircleFlag className="icon" id="cc" countryCode={flight.origin} height="34px"/>
                        <div id="countryname" ref={countryNameRef}>{flight.countryName}</div>
                    </li>
                    <li id="dist">
                        <RiPinDistanceLine className="icon" size="20px"/> {flight.distanceKM}
                    </li>
                    <li id="speed">
                        <BsSpeedometer2 className="icon" size="20px"/> {flight.velocity} km/h
                    </li>
                </ul>
            </div>
            {isExpanded && (
                <motion.div
                    className="flight-details"
                    initial={{height: 0, opacity: 0}}
                    animate={{height: 'auto', opacity: 1}}
                    exit={{height: 0, opacity: 0}}
                    transition={{duration: 0.3, ease: 'easeInOut' }}
                >
                    <div id="info-wrapper">
                        <div id="flight-status">
                            <h4>Flight number {flight.flightnumber}</h4>
                            <h4>{updatedStatus}</h4>
                        </div>
                        <h5>Operated by <span id="airline">{flight.airlineName}</span></h5>
                        <h6>{flight.aircraftName}</h6>
                        <div id="depart-arrive-wrapper">
                            <div id="depart">{flight.airportD}</div>
                            <div className="progress">
                                <div className="progress-bar" style={{ width: flight.progressPercentage + '%' }}>
                                    <TbPlane className="plane-icon" size="16px" color="black" />
                                </div>
                            </div>
                            <div id="arrive">{flight.airportA}</div>
                        </div>
                        <button onClick={() => openMapPopup(flight.callsign)}>View on Map</button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}