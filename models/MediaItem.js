const mongoose = require('mongoose');

const mediaItemSchema = new mongoose.Schema({
  type: {
    type: String, // 'youtube' or 'spotify'
    required: true,
  },
title: String,
  url: String,
  artistOrChannel: String,
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  aiSummary: String,
});

module.exports = mongoose.model('MediaItem', mediaItemSchema);