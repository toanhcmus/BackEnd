const express = require('express');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const confirmationCode = crypto.randomBytes(16).toString('hex');
    const user = new User({ email, confirmationCode });
    // await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Weather Forecast Subscription Confirmation',
      text: `Please confirm your subscription by clicking the following link: ${process.env.BASE_URL}/user/confirm/${confirmationCode}`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error sending confirmation email' });
      }
      await user.save();
      res.status(200).json({ message: 'Confirmation email sent' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error subscribing user' });
  }
});

router.get('/confirm/:id', async (req, res) => {
  try {
    const user = await User.findOne({ confirmationCode: req.params.confirmationCode });
    if (!user) {
      return res.status(404).json({ message: 'Invalid confirmation code' });
    }
    user.confirmed = true;
    await user.save();
    res.status(200).json({ message: 'Subscription confirmed' });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming subscription' });
  }
});

router.post('/unsubscribe', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }
    user.subscribed = false;
    await user.save();
    res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unsubscribing user' });
  }
});

module.exports = router;
