const express = require('express');
const { oauth2Client } = require('../services/youtubeAuth');
const router = express.Router();

router.get('/auth', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  res.redirect(url);
});

router.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Authorization code is missing.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.status(200).send('Authorization successful!');
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).send('Authorization failed.');
  }
});

module.exports = router;