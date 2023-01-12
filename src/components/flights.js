import React, { useEffect, useState} from 'react'
import haversine from 'haversine-distance'
import $ from 'jquery'
import {Collapse, collapse, accordion, Dropdown, progress} from 'bootstrap'
import { countryList } from './countrydata'
import { CircleFlag } from 'react-circle-flags'
import {TbPlaneOff, TbPlane } from 'react-icons/tb'
import {BsSpeedometer2} from 'react-icons/bs'
import {RiPinDistanceLine} from 'react-icons/ri'
import MyMap from './map'
import { aircrafticao } from './aircrafticao'

export default function Flights(props) {
    const [numLoad, addCards] = useState(5)
    const [sortBy, setSort] = useState('closest')
    var flightArr = []
    var airports = require('airport-codes');
    var airlines = require('airline-codes');
    

    if(props.load){
        var rawFlights = props.flightInfo
        rawFlights = JSON.parse(rawFlights)
        
        for (var i = 0; i < rawFlights.length; i++){
            let callsign = rawFlights[i][0]
    
            var origin = rawFlights[i][2]
            if(origin !== null){
                var countryName = countryList[origin]
                origin = origin.toLowerCase()
            }else{
                origin = "N/A"
                countryName = "N/A"
            }

            if(countryName === null || typeof countryName === 'undefined'){
                countryName = "N/A"
            }
    
            const status = rawFlights[i][9]
            const velocity = parseInt(rawFlights[i][5]).toFixed(0)
    
            const userCoords = { lat: props.userLat, lon: props.userLong}
            const planeCoords = { lat: rawFlights[i][3], lon: rawFlights[i][4]}
    
            const distanceToUser = haversine(userCoords, planeCoords);
            var distanceKM = (parseInt(distanceToUser) / 1000).toFixed(1) + " km"

            var departure = rawFlights[i][7]
            if(departure === null){departure = "N/A"}

            var arrival = rawFlights[i][8]
            if(arrival === null){arrival = "N/A"}

            var airportDInfo = getAirport(departure)
            var airportAInfo = getAirport(arrival)
            var airportDcoords = {lat: airportDInfo[1], lon: airportDInfo[2]}
            var airportAcoords = {lat: airportAInfo[1], lon: airportAInfo[2]}

            var progress = parseInt( ((haversine(planeCoords, airportDcoords)/1000) / (haversine(airportDcoords, airportAcoords)/1000))  * 100 )


            var airportD = airportDInfo[0] + ' (' +departure+ ')'
            var airportA = airportAInfo[0] + ' (' +arrival+ ')'



            var flightnumber = rawFlights[i][10]
            if(flightnumber === null){flightnumber = "N/A"}

            var airline = rawFlights[i][11]
            if(airline === null){
                airline = "N/A"
            } else{
                airline = getAirline(airline)
            }


            var aircraft_icao = rawFlights[i][1]
            if(aircraft_icao !== null){
                aircraft_icao = aircrafticao[aircraft_icao]
            }

            if (callsign === null){callsign = "N/A"}


            flightArr.push([callsign, origin, distanceKM, velocity, distanceToUser, countryName, status,
                planeCoords, airportD, airportA, flightnumber, airline, aircraft_icao, progress])
            $('#load-more').show()
            $('#total').show()

        }
    }
    function getAirline(icaocode){
        if (icaocode === 'N/A' || icaocode === null || typeof airlines.findWhere({icao: icaocode}) === 'undefined'){
            var airlineName = "N/A"
        }else{
            airlineName = airlines.findWhere({icao: icaocode}).get('name')
        }
        return airlineName
    }

    function getAirport(iatacode){
        if (iatacode === 'N/A' || iatacode === null || typeof airports.findWhere({iata: iatacode}) === 'undefined'){
            var airport = "N/A"
            var airport_lat
            var airport_long
        } else{
            airport = airports.findWhere({iata: iatacode}).get('name')
            airport_lat = airports.findWhere({iata: iatacode}).get('latitude')
            airport_long = airports.findWhere({iata: iatacode}).get('longitude')
        } 
        return [airport, airport_lat, airport_long]
    }

    function sortData(array, sortBy){
        if (sortBy === 'closest'){
            return array.sort((a,b) => a[4] - b[4]);
        } else if (sortBy === 'farthest'){
           return array.sort((a,b) => b[4] - a[4]);
        } else if (sortBy === 'velocity-highest'){
            return array.sort((a,b) => b[3] - a[3]);
        } else if (sortBy === 'velocity-lowest'){
            return array.sort((a,b) => a[3] - b[3]);
        }
    }
    
    flightArr = sortData(flightArr, sortBy)
    var flightArrNoSlice = flightArr
    flightArr = flightArr.slice(0,numLoad)

    if (flightArr.slice(0,numLoad).length === flightArrNoSlice.length && flightArr.length > 1){
        $('#load-more').hide()
    }

    return(
        <div id="container">
            <div id='dropdowndiv'>
                <div className="dropdown" >

                    <button  className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Sort by</button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <li><button className="dropdown-item" onClick={()=>setSort('closest')}>Closest</button></li>
                            <li><button className="dropdown-item" onClick={()=>setSort('farthest')}>Farthest</button></li>
                            <li><button className="dropdown-item" onClick={()=>setSort("velocity-highest")}>Velocity high</button></li>
                            <li><button className="dropdown-item" onClick={()=>setSort("velocity-lowest")}>Velocity low</button></li>
                        </ul>
                    </div>
                </div>
            <h5 id='total'>Showing {numLoad} of {flightArrNoSlice.length} flights near you</h5>
            <div id='flight-card-parent' className='accordion'>
                {flightArr.map((flight, i) => {
                    const id = "heading" + i
                    const collapse = "flush-collapse" + i
                    const dataTarget = "#" + collapse
                    
                    return <div className="accordion-item" key={i}>
                                <h2 className='accordion-header' id={id}>
                                    <button className='accordion-button collapsed' type='button' data-bs-toggle='collapse' data-bs-target={dataTarget} aria-expanded="false" aria-controls={collapse} id={flight}>
                                        <ul id='flight-info'>
                                            <span id='callsign'><li>{flight[6] === 'en-route' ? <TbPlane className='icon' color="green" size="20px"/>:<TbPlaneOff className='icon' color="red" size="20px"/> } {flight[0]}</li></span>
                                            <span id='origin'> <li><CircleFlag className='icon' id= 'cc' countryCode={flight[1]} height="20px"/>{flight[5]}</li></span>
                                            <span id='dist'> <li><RiPinDistanceLine className='icon' size="20px"/> {flight[2]}</li></span>
                                            <span id='speed'> <li><BsSpeedometer2 className='icon' size="20px"/> {flight[3]} km/h</li></span>
                                        </ul>
                                    </button>
                                </h2>
                                <div id={collapse} className='accordion-collapse collapse' aria-labelledby={id} data-bs-parent="#flight-card-parent">
                                    <div className='accordion-body'>
                                        <div id='info-wrapper'>
                                            <div id='flight-status'> 
                                                <h4>Flight number {flight[10]}</h4><div></div><h4>{flight[6]}</h4>
                                            </div>
                                            <h5>Operated by {flight[11]}</h5>
                                            <h6>{flight[12]}</h6>
                                            <div id='depart-arrive-wrapper'>
                                                <div id='depart'>{flight[8]}</div>
                                                <div class="progress">
                                                    <div class="progress-bar progress-bar-striped bg-success" role="progressbar" aria-label="Progress" style={{width: flight[13] + '%'}} aria-valuenow={flight[13]} aria-valuemin="0" aria-valuemax="100"></div>
                                                </div>
                                                <div id='arrive'>{flight[9]}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>            
                })}
            </div>
            <button type="button" id='load-more' onClick={() => addCards(numLoad + 5)}>Load more</button>
            <MyMap userLat={props.userLat} userLong={props.userLong} flights={flightArr} />

        </div>
    )
}