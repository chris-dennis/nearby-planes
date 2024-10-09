import haversine from 'haversine-distance';
import { countryList } from './data/countrydata.jsx';
import { aircrafticao } from './data/aircrafticao.jsx';
import airports from 'airport-codes';
import airlines from 'airline-codes';

export const getAirline = (iataCode) => {
    const airline = airlines.findWhere({ iata: iataCode });
    return airline ? airline.get('name') : 'N/A';
};

export const getAirport = (iataCode) => {
    const airport = airports.findWhere({ iata: iataCode });
    if (!airport)
        return { name: 'N/A', latitude: null, longitude: null };
    return {
        name: airport.get('name'),
        latitude: airport.get('latitude'),
        longitude: airport.get('longitude'),
    };
};

export const sortFlights = (flightsArray, sortBy) => {
    return flightsArray.sort((a, b) => {
        if (sortBy === 'closest') {
            return a.distanceToUser - b.distanceToUser;
        } else if (sortBy === 'farthest') {
            return b.distanceToUser - a.distanceToUser;
        } else if (sortBy === 'velocity-highest') {
            return b.velocity - a.velocity;
        } else if (sortBy === 'velocity-lowest') {
            return a.velocity - b.velocity;
        }
        return 0;
    });
};

export const processFlightsData = (flightLog, userLat, userLong) => {
    return flightLog.map((flightData) => {
        const [
            reg_number = 'N/A',
            aircraftIcao,
            flag,
            latitude,
            longitude,
            velocity,
            alt,
            dep_iata,
            arr_iata,
            status,
            airlineIata,
            flight_number = 'N/A',
        ] = flightData;

        const countryName = flag ? countryList[flag] || 'N/A' : 'N/A';
        const velocityRounded = parseInt(velocity).toFixed(0);
        const userCoords = { lat: userLat, lon: userLong };
        const planeCoords = { lat: latitude, lon: longitude };
        const distanceToUser = haversine(userCoords, planeCoords); // in meters

        // Convert distance to kilometers and round to one decimal place
        const distance = parseFloat((distanceToUser / 1000).toFixed(1));

        const distanceKM = `${distance} km`;

        const airlineName = airlineIata ? getAirline(airlineIata) : 'N/A';
        const aircraftName = aircraftIcao
            ? aircrafticao[aircraftIcao]
            : 'N/A';

        const airportDInfo = getAirport(dep_iata);
        const airportAInfo = getAirport(arr_iata);
        const airportDcoords = {
            lat: airportDInfo.latitude,
            lon: airportDInfo.longitude,
        };
        const airportAcoords = {
            lat: airportAInfo.latitude,
            lon: airportAInfo.longitude,
        };

        const totalDistance =
            haversine(airportDcoords, airportAcoords) / 1000 || 1; // in km
        const progressDistance =
            haversine(planeCoords, airportDcoords) / 1000; // in km
        const progressPercentage = parseInt(
            (progressDistance / totalDistance) * 100
        );

        const airportD = `${airportDInfo.name} (${dep_iata || 'N/A'})`;
        const airportA = `${airportAInfo.name} (${arr_iata || 'N/A'})`;

        return {
            callsign: reg_number,
            origin: flag ? flag.toLowerCase() : 'N/A',
            countryName,
            status,
            velocity: velocityRounded,
            distanceKM,
            distance,
            distanceToUser,
            planeCoords,
            airportD,
            airportA,
            flightnumber: flight_number,
            airlineName,
            aircraftName,
            progressPercentage,
        };
    });
};
