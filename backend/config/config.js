const dotenv = require('dotenv');

// Load environment variables from .env file if it exists
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://saliniyan:saliniyan@cluster0.tp4v7al.mongodb.net/consiltency?retryWrites=true&w=majority&appName=Cluster0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Add any other configuration variables here
};