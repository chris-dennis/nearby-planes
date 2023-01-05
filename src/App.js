import './App.css';
import React, {useEffect, useState} from 'react'
import Location from './components/location';
import Flights from './components/flights';
import { TbRefresh } from 'react-icons/tb';
import $ from 'jquery'

function App() {
  const [locationStatus, setLocationStatus] = useState(false)
  const [userLat, setUserLat] = useState(0)
  const [userLong, setUserLong] = useState(0)
  const [flightLog, getFlightLog] = useState([])
  const [cardsLoaded, setCardsLoaded] = useState(false)
  const [dist, setDist] = useState(25)

  const newdist = (dist / 111) // not accurate lol
  const lamin = userLat - newdist
  const lomin = userLong - newdist
  const lamax = userLat + newdist
  const lomax = userLong + newdist

  const fetchFlight = () => {
    fetch('https://nearby-planes.herokuapp.com/api', {
      headers: {lamin: lamin, lomin: lomin, lamax: lamax, lomax: lomax}
    })
    .then((response) => response.text())
    .then((response) => {
        getFlightLog(response)
        setCardsLoaded(true)
        $('.dropdown').show()
        $('#distance-controls').show()
    })
  }
  


  const getLocation = () => {
    if (!navigator.geolocation){
        console.log("browser probably does not support location")
    } else{
        navigator.geolocation.getCurrentPosition((position) => {
            setLocationStatus(true)
            setUserLat(position.coords.latitude)
            setUserLong(position.coords.longitude)
        }, () => {
            setLocationStatus(false)
            $('#fetch-flights').prop('disabled', true);
            console.log("unable to retrieve location info")
            $('#location-reminder').show()
        });   
    }
  }

  useEffect(() =>{
    getLocation()
    $('#distance-controls').show()
    setDist($('input[type=radio]:checked').val())
    $('#total').hide()
    if (userLat === 0 || userLong === 0){
        setLocationStatus(false)
        $('#load-more').hide()
        $('#flight-count').hide()
        $('#location-reminder').hide()
        $('.dropdown').hide()
        $('#distance-controls').hide()
      
    }
  }, [userLat, userLong])

  return (
    <div className="App">
            <div id='top'>
                <p id='location-reminder'>Location is required to use this app</p>
            </div>
            <div id='welcome-info'>
              <h2>Welcome!</h2> 
              <h3>Click Fetch Flights to retrieve nearest flights.</h3>
              <h5>This page uses data from <a rel='noreferrer' href='https://airlabs.co/' target='_blank'>AirLabs</a> and Google Maps.</h5>
              <div id='button-wrapper'>
                <button onClick={fetchFlight} id='fetch-flights' type='button' disabled={!locationStatus}>{cardsLoaded ? <span><TbRefresh size="20px" />Refresh</span>: "Fetch Flights"}</button>
                <div id='distance-controls' className='top-child'>
                      <input type='radio' id='5km' name='distance' value='25' onChange={() => setDist(25)} defaultChecked /><label>200 km</label>
                      <input type='radio' id='25km' name='distance' value='50' onChange={() => setDist(50)}/><label>250 km</label>
                      <input type='radio' id='50km' name='distance' value='75' onChange={() => setDist(75)} /><label>300 km</label>
                </div>
              </div>
            </div>

      <Location userLat={userLat} userLong={userLong}/>
      <Flights userLat={userLat} userLong={userLong} flightInfo={flightLog} load={cardsLoaded}/>
    </div>
  );
}

export default App;
