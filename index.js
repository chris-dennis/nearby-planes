const PORT = process.env.PORT || 3001
const express = require('express')
const path = require('path')

const cors = require('cors')
const axios = require('axios')
const { json } = require('express')

require('dotenv').config()

var apiKey = process.env.apiKey

const app = express()
app.use(cors())
app.use(express.static(path.resolve(__dirname, 'build')))

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '/build/index.html'));
  });

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
        res.json(parsedData) // to display
    }
    )

})

app.listen(PORT, () => console.log("Server is running"))


