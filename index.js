const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const weatherRoutes = require('./routes/weather');
const userRoutes = require('./routes/user');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const User = require("./models/User");
const WeatherHistory = require("./models/WeatherHistory");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/weather', weatherRoutes);
app.use('/user', userRoutes);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendDailyWeatherEmails() {
  const users = await User.find({ confirmed: true, subscribed: true });
  const history = await WeatherHistory.find();

  let weatherInfo = "";

  for (const entry of history) {
    const city = entry.city;
    try {
      const response = await axios.get(
        `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`
      );
      const weatherData = response.data;
      weatherInfo += `City: ${city}\nToday's weather: ${weatherData.current.condition.text}\nTemperature: ${weatherData.current.temp_c}°C\n\n`;
    } catch (error) {
      console.error(`Error fetching weather data for ${city}:`, error);
    }
  }

  const emailPromises = users.map(async (user) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Daily Weather Forecast",
      text: weatherInfo,
    };

    return transporter.sendMail(mailOptions);
  });

  await Promise.all(emailPromises);
}

cron.schedule('0 5 * * *', () => {
  console.log('Sending daily weather emails');
  sendDailyWeatherEmails().catch(console.error);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
