import './App.css';
import { useState } from 'react';
import Flights from './components/Flights';
import { TbRefresh, TbSearch, TbCurrentLocation } from 'react-icons/tb';
import Select from 'react-select';
import { AIRPORTS } from "./components/data/airports.jsx";
import { motion } from 'framer-motion';
import Footer from "./components/footer.jsx";

const DEFAULT_LOCATION = {
    // todo: randomize
    name: 'John F. Kennedy',
    lat: 40.6413,
    lng: -73.7781,
};

function App() {
    const [location, setLocation] = useState(DEFAULT_LOCATION);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    const airportOptions = [
        { value: 'current_location', label: 'Current Location' },
        ...AIRPORTS.map((airport) => ({
            value: airport.name,
            label: airport.name,
            lat: airport.lat,
            lng: airport.lng,
        })),
    ];

    const handleSelectChange = (selectedOption) => {
        if (!selectedOption) return;

        if (selectedOption.value === 'current_location') {
            handleUseCurrentLocation();
        } else {
            const selectedLocation = {
                name: selectedOption.value,
                lat: selectedOption.lat,
                lng: selectedOption.lng,
            };
            setLocation(selectedLocation);
            setSearchInput(selectedOption.value);
            setError(null);
        }
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {

            setIsFetchingLocation(true);
            if (userLocation){
                setLocation(userLocation);
                setSearchInput('Current Location');
                setIsFetchingLocation(false);
                setError(null);
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currentLocation = {
                        name: 'Current Location',
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setLocation(currentLocation);
                    setSearchInput('Current Location');
                    setUserLocation(currentLocation)
                    setIsFetchingLocation(false);
                    setError(null);
                },
                (err) => {
                    setError('Unable to retrieve your location, try refreshing');
                    setIsFetchingLocation(false);
                    console.error(err);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser.');
        }
    };

    const style = {
        control: (base) => ({
            ...base,
            border: 0,
            borderRadius: 25,
            boxShadow: "none",
            zIndex: 0,
        }),
        menu: (base) => ({
            ...base,
            zIndex: 1000,
        }),
        indicatorSeparator: (base) =>({
            ...base,
            display: "none"
        })
    };

    return (
        <div className="App">
            <header>
                <h1>Nearby Planes</h1>
                <div id="location-selector" className="location-selector">
                    <div className="select-container">
                        <Select
                            options={airportOptions}
                            value={airportOptions.find(option => option.label === searchInput)}
                            onChange={handleSelectChange}
                            placeholder="Select an airport..."
                            isClearable={false}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={style}
                            isDisabled={isFetchingLocation}
                        />
                        <button
                            onClick={handleUseCurrentLocation}
                            disabled={isFetchingLocation}
                            className="current-location-button"
                            title="Use Current Location"
                        >
                            {isFetchingLocation ?
                                <motion.div animate={{rotate: 360}} transition={{repeat: Infinity, duration: 1, ease: 'linear'}}>
                                    <TbRefresh/>
                                </motion.div> : <TbCurrentLocation/>}
                        </button>
                        {/*<span className="vertical-line"></span>*/}
                        {/*<button onClick={() => handleSelectChange(searchInput)} className="search-button" title="Search">*/}
                        {/*    <TbSearch />*/}
                        {/*</button>*/}
                    </div>
                    {error && <p className="error">{error}</p>}
                </div>
            </header>
            <main>
                <Flights userLat={location.lat} userLong={location.lng} />
            </main>
            <Footer />
        </div>
    );
}

export default App;
