const express = require('express');
const axios = require('axios');
const WeatherHistory = require('../models/WeatherHistory');
const router = express.Router();

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

    // console.log(currentWeather);
    const today = data.forecast.forecastday[0].date;

    const forecast = data.forecast.forecastday.filter(day => today !== day.date).map(day => ({
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

    // console.log(dataRes);

    // Save to history
    const existingHistory = await WeatherHistory.findOne({ city });
    if (!existingHistory) {
      const history = new WeatherHistory({ city, data: currentWeather });
      await history.save();
    } else {
      const updateHistory = await WeatherHistory.findOneAndUpdate(
        { city },
        { data: currentWeather },
        { new: true, upsert: true }
      );
    }

    res.json(dataRes);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching forecast data' });
  }
});

router.get('/search-history', async (req, res) => {
  try {
    const history = await WeatherHistory.find();
    res.json(history);
    // console.log(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching search history' });
  }
});

module.exports = router;