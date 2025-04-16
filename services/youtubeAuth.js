const { google } = require('googleapis');
const Token = require('../models/Token');

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

async function ensureValidAccessToken(userId) {
  
  const userToken = await Token.findOne({ userId });

  if (!userToken) {
    throw new Error('User token not found.');
  }

  // Перевірка, чи токен закінчився
  if (userToken.expiryDate && userToken.expiryDate < Date.now()) {
    console.log('Access token expired. Refreshing...');
    oauth2Client.setCredentials({
      refresh_token: userToken.refreshToken,
    });

    try {
      // Оновлення токенів
      const { credentials } = await oauth2Client.refreshAccessToken();

      // Оновлення токенів у базі даних
      userToken.accessToken = credentials.access_token;
      userToken.expiryDate = credentials.expiry_date ? new Date(credentials.expiry_date) : null;
      await userToken.save();

      console.log('Access token refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token.');
    }
  }

  // Встановлення оновленого токена
  oauth2Client.setCredentials({
    access_token: userToken.accessToken,
  });

  return oauth2Client;
}

module.exports = { oauth2Client, ensureValidAccessToken };