const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });