const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  confirmed: { type: Boolean, default: false },
  subscribed: { type: Boolean, default: true },
  confirmationCode: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
