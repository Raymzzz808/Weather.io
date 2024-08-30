import express from "express";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = 3000;
const API_key = process.env.API_coordinates;
const title= "Weather.IO";
const subTitle= "The Live Weather API";
const weatherDataStore = {};

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
    res.render("index.ejs",{
        title,
        subTitle,
        zip: ""
    });
});

app.post("/", async (req, res) => {
    const city  = req.body.city;
    const API_URL = `http://api.weatherapi.com/v1/current.json?key=${API_key}&q=${city}&aqi=yes`;

    try {
        // Make the API request using axios
        const apiResponse = await axios.get(API_URL);

        // Extract the data from the API response
        const data = apiResponse.data;

        // Process the weather data
        const weather = {
            icon: data.current.condition.icon,
            id: city,
            city: data.location.name,
            state: data.location.region,
            coordinates: {
                longitude: data.location.lon,
                latitude: data.location.lat
            },
            temp: {
                currentTemp: data.current.temp_f,
                humidity: data.current.humidity,
                feels_like: data.current.feelslike_f,
            },

            conditions: {
                clouds: data.current.cloud,
                rain: data.current.precip_in,
                condition: data.current.condition.text,
                condition_icon: data.current.condition.icon,
                uv_index: data.current.uv,
                windSpeed: data.current.wind_mph,
                windGust: data.current.gust_mph,
                windDirection: data.current.wind_dir
               
            },

            current_date: {
                day: {
                    dayArray: [
                        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
                    ],
                    dayNum: new Date().getDay(),
                },
                date: new Date().getDate(),
                month: {
                    monthArray: [
                        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
                    ],
                    monthNum: new Date().getMonth(),
                },
                year: new Date().getFullYear(),
            },
        };

        // Store weather data temporarily
        weatherDataStore[city] = weather;
        

        // Redirect to the page with the weather ID
        res.redirect(`/weather/${weather.id}`);


    } catch (error) {
        console.log(weatherDataStore[city]);

        console.error("Error fetching weather data:", error.response ? error.response.data: error.message);

        // Render the error page
        res.render("index.ejs", {
            error: "Oops! There seems to be some error, Please try again!",
        });
    }
});

app.get('/weather/:id', (req, res) => {
    const id = decodeURIComponent(req.params.id);
    const weather = weatherDataStore[id]; // Retrieve the weather data from the store

    if (weather) {
        res.render("weather.ejs", {
            city: weather.city + ", ",
            state: weather.state,
            coordinates: {
                latitude: weather.coordinates.latitude,
                longitude: weather.coordinates.longitude,
            },
            temp: weather.temp.currentTemp + "ºF",
            humidity: weather.temp.humidity + "%",
            feels: weather.temp.feels_like + "ºF",
            uv_index: weather.conditions.uv_index,
            clouds: weather.conditions.clouds + "%",
            rain: weather.conditions.rain,
            windSpeed: weather.conditions.windSpeed,
            windGust: weather.conditions.windGust,
            windDirection: weather.conditions.windDirection,
            condition: weather.conditions.condition,
            condition_icon: weather.conditions.condition_icon, // ICON!
            date: weather.current_date,
            title,
            subTitle,
            icon:weather.icon
        });
    } else {
        console.log("Weather data not found for ID:", id);
        console.log(weatherDataStore[city]);
        res.redirect("/");
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
