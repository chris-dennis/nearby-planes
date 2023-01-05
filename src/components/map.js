import { GoogleMap, MarkerF, LoadScript } from '@react-google-maps/api';
import React from 'react'

const containerStyle = {
    width: '748px',
    height: '500px',
    margin: '20px',
  };

const containerStyleTwo = {
  width: '430px',
  height: '500px',
  margin: '20px',
}

  function MyMap(props) {
    let width = window.innerWidth
    if (props.flights.length !== 0 && props.userLat !== 0){
      return (
          <LoadScript
            googleMapsApiKey='AIzaSyD4Ait-DCQW_I-wk9WeGDS8SygneGIaSGk'
          >
            <GoogleMap className='map'
              mapContainerStyle={(width < 768)? containerStyleTwo : containerStyle}
              center={{lat: props.userLat, lng: props.userLong}}
              zoom={7}
            >
              
              { /* Child components, such as markers, info windows, etc. */ }
              <MarkerF position={{lat: props.userLat, lng: props.userLong}} label={"Your location"}/>
              {props.flights.map((flight, i) => {
                  let position = {lat: flight[7].lat, lng: flight[7].lon}
                  let label = flight[0];
                  return(
                    <MarkerF key={i} position={position} label={label}/>
                  )
                  
              } )}
            </GoogleMap>
          </LoadScript>
        )
    }
  }
export default React.memo(MyMap)

