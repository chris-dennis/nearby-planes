import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import L from 'leaflet';
import {AIRPORTS} from "./data/airports.jsx";

// Center on map
function MapView({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);
    return null;
}

function Map({userLat, userLong, flights, radius, selectedFlightOnMap, setSelectedFlightOnMap, scrollToFlightCard, showAirports}) {
    const [selectedFlight, setSelectedFlight] = useState(null);
    const markerRefs = useRef({});

    // Set the selected flight based on selectedFlightOnMap
    useEffect(() => {
        if (selectedFlightOnMap) {
            const flight = flights.find((flight) => flight.callsign === selectedFlightOnMap);
            if (flight) {
                setSelectedFlight(flight);
            }
        } else {
            setSelectedFlight(null);
        }
    }, [selectedFlightOnMap, flights]);

    // Open the popup when selectedFlight changes
    useEffect(() => {
        if (selectedFlight) {
            const marker = markerRefs.current[selectedFlight.callsign];
            if (marker) {
                marker.openPopup();
            }
        }
    }, [selectedFlight]);

    // Effect to close all popups when the user location changes
    useEffect(() => {
                Object.values(markerRefs.current).forEach((marker) => {
            if (marker) {
                marker.closePopup();
            }
        });
        setSelectedFlight(null);
    }, [userLat, userLong]);

    const position = [userLat, userLong];

    const planeIcon = L.icon({
        iconUrl: '/plane.png',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });

    const airportIcon = L.icon({
        iconUrl: '/airport.png',
        iconSize: [30, 30],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    })

    const locationIcon = L.icon({
        iconUrl: '/location.png',
        iconSize: [30, 30],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    })

    return (
        <MapContainer
            center={position}
            zoom={7}
            className="map-container"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />

            {/* Adjust map view when selectedFlight changes */}
            {selectedFlight && (
                <MapView center={[selectedFlight.planeCoords.lat, selectedFlight.planeCoords.lon]} />
            )}

            {/* User Location Marker */}
            <Marker icon={locationIcon} position={position}>
                <MapView center={position}/>
                <Popup>Selected Location</Popup>
            </Marker>

            {/* Radius Circle */}
            <Circle
                center={position}
                radius={radius * 1000} // Convert km to meters
                pathOptions={{ color: 'blue', fillColor: 'none', fillOpacity: 0.1 }}
            />

            {/* Flight Markers */}
            {flights.map((flight) => (
                <Marker
                    key={flight.callsign}
                    icon={planeIcon}
                    position={[flight.planeCoords.lat, flight.planeCoords.lon]}
                    eventHandlers={{
                        click: () => {
                            setSelectedFlight(flight);
                            setSelectedFlightOnMap(flight.callsign);
                        },
                    }}
                    ref={(el) => {
                        if (el) {
                            markerRefs.current[flight.callsign] = el;
                        }
                    }}
                >
                    <Popup onClose={() => {setSelectedFlight(null);setSelectedFlightOnMap(null);}}>
                        <motion.div
                            className="popup-content"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3>Flight {flight.callsign}</h3>
                            <p>Airline: {flight.airlineName}</p>
                            <p>Status: {flight.status}</p>
                            <p>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToFlightCard(flight.callsign);
                                        setSelectedFlight(null);
                                        setSelectedFlightOnMap(null);
                                    }}
                                >
                                    View Details
                                </a>
                            </p>
                        </motion.div>
                    </Popup>
                </Marker>
            ))}

            {/* Airport Markers */}
            {showAirports && AIRPORTS.map((airport) => (
                <Marker
                    key={airport.name}
                    icon={airportIcon}
                    position={[airport.lat, airport.lng]}
                >
                    <Popup>
                        <h3>{airport.name}</h3>
                        <p>Latitude: {airport.lat}</p>
                        <p>Longitude: {airport.lng}</p>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default Map;
