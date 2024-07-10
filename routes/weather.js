const express = require('express');
const axios = require('axios');
const WeatherHistory = require('../models/WeatherHistory');
const router = express.Router();

// router.get('/current/:city', async (req, res) => {
//   const city = req.params.city;
//   console.log(city);
//   try {
//     const response = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`);
//     const data = response.data;

//     const weatherInfo = {
//       city: data.location.name,
//       country: data.location.country,
//       date: data.location.localtime.split(' ')[0],
//       temp: data.current.temp_c,
//       wind: data.current.wind_kph,
//       humidity: data.current.humidity,
//       condition: data.current.condition.text,
//       icon: data.current.condition.icon,
//     };

//     // Save to history
//     const history = new WeatherHistory({ city, data: weatherInfo });
//     await history.save();

//     res.json(weatherInfo);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching weather data' });
//   }
// });

router.get('/forecast/:city', async (req, res) => {
  const city = req.params.city;
  console.log(city);
  try {
    const response = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${city}&days=10`);
    const data = response.data;

    const current = data.forecast.forecastday[0];

    const currentWeather = {
      city: data.location.name,
      date: current.date,
      temp: current.day.avgtemp_c,
      wind: current.day.maxwind_kph,
      humidity: current.day.avghumidity,
      condition: current.day.condition.text,
      img: current.day.condition.icon,
    };

    console.log(currentWeather);

    const forecast = data.forecast.forecastday.map(day => ({
      date: day.date,
      temp: day.day.avgtemp_c,
      wind: day.day.maxwind_kph,
      humidity: day.day.avghumidity,
      condition: day.day.condition.text,
      img: day.day.condition.icon,
    }));

    const dataRes = {
      forecast: forecast,
      currentWeather: currentWeather
    }

    console.log(dataRes);

    // Save to history
    const history = new WeatherHistory({ city, data: currentWeather });
    await history.save();

    res.json(dataRes);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching forecast data' });
  }
});

module.exports = router;