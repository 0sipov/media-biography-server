const connectDB = require('./db');
const MediaItem = require('./models/MediaItem');
require('dotenv').config();

async function addTestItem() {
  const item = new MediaItem({
    type: 'youtube',
    title: 'My first video',
    url: 'https://youtube.com/watch?v=example',
    artistOrChannel: 'Test Channel',
  });

  await item.save();
  console.log('Test media item saved ✅');
}

connectDB().then(addTestItem);