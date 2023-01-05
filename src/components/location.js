import Geocode from 'react-geocode'
import { countryList } from './countrydata'
import {useState, useEffect} from 'react'
import { TbLocation } from 'react-icons/tb'

Geocode.setApiKey('AIzaSyBqC3NgcSzudh9qQAqMF5oJTg4v-PkYjGo')
var countryCode = countryList[origin]


export default function Location(props){
    const [locationDisplay, setLocationDisplay] = useState('')
    
    Geocode.setRegion(countryCode)
    Geocode.fromLatLng((props.userLat), (props.userLong)).then(
    (response) => {
        const address = response.results[0].formatted_address;
        let city, state;
        for (let i = 0; i < response.results[0].address_components.length; i++) {
        for (let j = 0; j < response.results[0].address_components[i].types.length; j++) {
            switch (response.results[0].address_components[i].types[j]) {
            case "locality":
                city = response.results[0].address_components[i].long_name;
                break;
            case "administrative_area_level_1":
                state = response.results[0].address_components[i].long_name;
                break;
            default:
                break;
            }
        }
        }
        setLocationDisplay(city + ", " + state)
    },
    );

    return(
        <h5 id="location">Searching near <span id='location-disp'>{locationDisplay} <TbLocation /></span></h5>
    )

    
}