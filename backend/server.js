const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { PORT, MONGODB_URI } = require('./config/config');
const orderRoutes = require('./routes/orderRoutes');
const stockRoutes = require('./routes/stockRoutes');

// Initialize Express app
const app = express();

// Use middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json({ limit: '10mb' })); // Parse JSON bodies with increased size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/stock', stockRoutes);

let qrScanned = false;

// Called when QR is scanned
app.get('/', (req, res) => {
  qrScanned = true;
  res.send("Car Spare Parts Inventory Tracker API Server");
});

// Called by frontend before submitting
app.get('/api/check-scan', (req, res) => {
  res.json({ scanned: qrScanned });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.log('Error connecting to MongoDB Atlas: ', err));

// Set the server to listen on a port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});