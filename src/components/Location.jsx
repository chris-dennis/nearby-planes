import { useState, useEffect } from 'react';
import Geocode from 'react-geocode';
import { TbLocation } from 'react-icons/tb';

Geocode.setApiKey(process.env.geoApiKey);

export default function Location({ userLat, userLong, len }) {
    const [locationDisplay, setLocationDisplay] = useState('');

    useEffect(() => {
        if (userLat && userLong) {
            Geocode.fromLatLng(userLat, userLong).then(
                (response) => {
                    const addressComponents = response.results[0].address_components;
                    const cityComponent = addressComponents.find((comp) =>
                        comp.types.includes('locality')
                    );
                    const stateComponent = addressComponents.find((comp) =>
                        comp.types.includes('administrative_area_level_1')
                    );
                    const city = cityComponent ? cityComponent.long_name : '';
                    const state = stateComponent ? stateComponent.long_name : '';
                    setLocationDisplay(`${city !== "" ? city + ',' : ''} ${state}`);},
                (error) => {
                    console.error(error);
                    setLocationDisplay('Unknown location');
                }
            );
        }
    }, [userLat, userLong]);

    return (
        <h5 id="location">
            Showing {len} flights near{' '}
            <span id="location-disp">
        {locationDisplay} <TbLocation />
      </span>
        </h5>
    );
}