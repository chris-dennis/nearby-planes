const PORT = 3001 || process.env.PORT
const express = require('express')
const path = require('path')

const cors = require('cors')
const axios = require('axios')
const { json } = require('express')

require('dotenv').config()

var apiKey = process.env.apiKey

const app = express()
app.use(cors())

app.get('/', (req,res) => {
    const options ={
        method: 'GET',
        url: 'https://airlabs.co/api/v9/flights?_view=array&_fields=reg_number,aircraft_icao,flag,lat,lng,speed,alt,dep_iata,arr_iata,status&bbox='
         + req.headers.lamin + ',' + req.headers.lomin + ',' + req.headers.lamax + ',' + req.headers.lomax + '&api_key=' + apiKey,
        responseType: 'text'
    }
    
    axios.request(options)
    .then((response) => {
        var parsedData = JSON.parse(response.data) // required 
        res.json(parsedData) // to display it on localhost:3001
    }
    )

})

app.listen(PORT, () => console.log("Server is running"))


