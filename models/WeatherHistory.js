const mongoose = require('mongoose');

const weatherHistorySchema = new mongoose.Schema({
  city: String,
  data: Object,
  date: { type: Date, default: Date.now, expires: 86400 }, // Expire after 24 hours
});

module.exports = mongoose.model('WeatherHistory', weatherHistorySchema);
