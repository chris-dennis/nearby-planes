import express from 'express';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Equivalent to __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiKey = process.env.apiKey;

// Middleware
app.use(cors());
app.use(express.json());

// API route
app.get('/api', (req, res) => {
    const options = {
        method: 'GET',
        url: `https://airlabs.co/api/v9/flights?_view=array&_fields=reg_number,aircraft_icao,flag,lat,lng,speed,alt,dep_iata,arr_iata,status,airline_iata,flight_number&bbox=${req.headers.lamin},${req.headers.lomin},${req.headers.lamax},${req.headers.lomax}&api_key=${apiKey}`,
        responseType: 'text',
    };

    axios.request(options)
        .then((response) => {
            res.json(JSON.parse(response.data));
            console.log("Response sent");
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error fetching data' });
        });
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});