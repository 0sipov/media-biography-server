const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: String, // Ідентифікатор користувача (якщо є)
  accessToken: String,
  refreshToken: String,
  scope: String,
  tokenType: String,
  expiryDate: Date, // Дата закінчення дії токена
});

module.exports = mongoose.model('Token', tokenSchema);