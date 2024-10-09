import { useState, useEffect, useCallback, useRef } from 'react';
import FlightCard from './FlightCard';
import {sortFlights, processFlightsData,} from './utilities';
import MyMap from "./map.jsx";
import debounce from 'lodash.debounce';
import Location from "./Location.jsx";

export default function Flights({ userLat, userLong }) {
    const MAX_DISTANCE = 300; // for api calls

    const [allFlights, setAllFlights] = useState([]);
    const [flights, setFlights] = useState([])
    const [cardsLoaded, setCardsLoaded] = useState(false);
    const [sortBy, setSortBy] = useState('closest');
    const [dist, setDist] = useState(200);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAirports, setShowAirports] = useState(false);

    const [selectedFlightOnMap, setSelectedFlightOnMap] = useState(null);
    const [expandedFlightCallsign, setExpandedFlightCallsign] = useState(null);

    const flightCardRefs = useRef({});
    const mapContainerRef = useRef(null);


    const fetchFlights = useCallback(async () => {
        const lamin = userLat - (MAX_DISTANCE / 111);
        const lomin = userLong - (MAX_DISTANCE / 111);
        const lamax = userLat + (MAX_DISTANCE / 111);
        const lomax = userLong + (MAX_DISTANCE / 111);

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('https://nearby-planes.herokuapp.com/api', {
                headers: { lamin, lomin, lamax, lomax },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const processedFlights = processFlightsData(
                data,
                userLat,
                userLong,
                MAX_DISTANCE
            );
            setAllFlights(processedFlights);
            setCardsLoaded(true);
        } catch (err) {
            setError('Failed to fetch flight data.');
            console.error('Error fetching flight data:', err);
        } finally {
            setLoading(false);
        }
    }, [userLat, userLong]);

    // Prevent rapid api calls
    const debouncedFetchFlights = useCallback(
        debounce(() => {
            fetchFlights();
        }, 500),
        [fetchFlights]
    );

    const toggleShowAirports = () => {
        setShowAirports(prevState => !prevState);
    };

    // Fetch flights on component mount and when user location changes
    useEffect(() => {
        debouncedFetchFlights();
        return debouncedFetchFlights.cancel;
    }, [debouncedFetchFlights]);

    // Function to filter and sort flights based on current distance and sort criteria
    const filterAndSortFlights = useCallback(() => {
        const filteredFlights = allFlights.filter(flight => flight.distance <= dist);
        const sortedFlights = sortFlights(filteredFlights, sortBy);

        setFlights(sortedFlights);
    }, [allFlights, dist, sortBy]);

    // Debounce the filter and sort function to optimize performance
    const debouncedFilterAndSort = useCallback(
        debounce(() => {
            filterAndSortFlights();
        }, 300),
        [filterAndSortFlights]
    );

    // Apply filtering and sorting whenever allFlights, dist, or sortBy changes
    useEffect(() => {
        debouncedFilterAndSort();
        return debouncedFilterAndSort.cancel;
    }, [allFlights, dist, sortBy, debouncedFilterAndSort]);

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handleDistChange = (e) => {
        setDist(parseInt(e.target.value, 10));
    };

    const scrollToFlightCard = (callsign) => {
        if (flightCardRefs.current[callsign]) {
            flightCardRefs.current[callsign].scrollIntoView({ behavior: 'smooth', block: 'center' });
            setExpandedFlightCallsign(callsign);
        }
    };

    const openMapPopup = (callsign) => {
        setSelectedFlightOnMap(callsign);
        if (mapContainerRef.current) {
            mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div id="flights">
            <div id="map-container" ref={mapContainerRef}>
                <MyMap
                    userLat={userLat}
                    userLong={userLong}
                    flights={flights}
                    radius={dist}
                    selectedFlightOnMap={selectedFlightOnMap}
                    setSelectedFlightOnMap={setSelectedFlightOnMap}
                    scrollToFlightCard={scrollToFlightCard}
                    showAirports={showAirports}
                />
            </div>
            <div id="controls-container">
                <div id="distance-controls" className="top-child">
                    <label htmlFor="distance-slider">Radius: {dist} km</label>
                    <input
                        type="range"
                        id="distance-slider"
                        name="distance-slider"
                        min="10"
                        max="300"
                        step="10"
                        value={dist}
                        onChange={handleDistChange}
                    />
                </div>
                <div id="sort-controls" className="top-child">
                    <label htmlFor="sort-select">Sort by: </label>
                    <select id="sort-select" value={sortBy} onChange={handleSortChange}>
                        <option value="closest">Closest</option>
                        <option value="farthest">Farthest</option>
                        <option value="velocity-highest">Velocity High</option>
                        <option value="velocity-lowest">Velocity Low</option>
                    </select>
                    <div id="airport-toggle-controls" className="top-child">
                        <button onClick={toggleShowAirports}>
                            {showAirports ? 'Hide Airports' : 'Show Airports'}
                        </button>
                    </div>
                </div>
            </div>
            {error && <p className="error">{error}</p>}
            {cardsLoaded && (
                <div id="container">
                    {flights.length > 0 ? (
                        <Location userLat={userLat} userLong={userLong} len={flights.length} />
                    ) : (
                        <p>No Flights Found</p>
                    )}
                    <div id="flight-card-parent">
                        {flights.map((flight) => (
                            <div
                                key={flight.callsign}
                                ref={(el) => (flightCardRefs.current[flight.callsign] = el)}
                            >
                                <FlightCard
                                    flight={flight}
                                    expandedFlightCallsign={expandedFlightCallsign}
                                    setExpandedFlightCallsign={setExpandedFlightCallsign}
                                    openMapPopup={openMapPopup}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {!cardsLoaded && loading && <p className="loading">Loading flights...</p>}
        </div>
    );
}
