const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { PORT, MONGODB_URI } = require('./config/config');
const orderRoutes = require('./routes/orderRoutes');
const stockRoutes = require('./routes/stockRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Global scan tracking
let scanCount = 0;

// QR scan endpoint (frontend hits this on each scan)
app.get('/', (req, res) => {
  scanCount++;
  res.send("QR scan registered.");
});

// Frontend checks if 2 scans have happened before enabling order submission
app.get('/api/check-scan', (req, res) => {
  res.json({ scanned: scanCount >= 1 });
});

// Reset scan count after successful order submission
app.post('/api/reset-scan', (req, res) => {
  scanCount = 0;
  res.json({ message: 'QR scan count reset.' });
});

// Routes
app.use('/api/orders', orderRoutes);  // Assume orderRoutes internally calls /api/reset-scan after storing
app.use('/api/stock', stockRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// MongoDB Connection and Server Start
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log('Error connecting to MongoDB Atlas: ', err));
