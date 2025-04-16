const express = require('express');
const { oauth2Client } = require('../services/youtubeAuth');
const Token = require('../models/Token');
const router = express.Router();
const { google } = require('googleapis');

router.get('/auth', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
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

    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2',
      });
      
      const userInfo = await oauth2.userinfo.get();
      const email = userInfo.data.email;
      
      if (!email) {
        return res.status(400).send('Failed to retrieve user email.');
      }
      
      const tokenData = {
        userId: email, // Використовуємо email як userId
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      };

    await Token.findOneAndUpdate(
      { userId: tokenData.userId },
      tokenData,
      { upsert: true, new: true }
    );

    res.status(200).send('Authorization successful and tokens saved to database!');
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).send(`Authorization failed: ${error.message}`);
  }
});

// Додатковий маршрут для оновлення токенів
router.get('/refresh-token', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).send('User ID is missing.');
  }

  try {
    const userToken = await Token.findOne({ userId });

    if (!userToken || !userToken.refreshToken) {
      return res.status(400).send('Refresh token is missing.');
    }

    oauth2Client.setCredentials({
      refresh_token: userToken.refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    userToken.accessToken = credentials.access_token;
    userToken.expiryDate = credentials.expiry_date ? new Date(credentials.expiry_date) : null;
    await userToken.save();

    res.status(200).send('Access token refreshed successfully!');
  } catch (error) {
    console.error('Error refreshing access token:', error);
    res.status(500).send(`Failed to refresh access token: ${error.message}`);
  }
});

module.exports = router;