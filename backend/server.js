const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { PORT, MONGODB_URI } = require('./config/config');
const Order = require('./models/Order'); // Ensure you have this model defined
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

// Global state for QR tracking
let times = 0;
let qrScanned = false;

// Route: simulate QR scan
app.get('/', (req, res) => {
  times++;
  if (times >= 2) {
    qrScanned = true;
  }
  res.send("Car Spare Parts Inventory Tracker API Server");
});

// Check if QR was scanned twice
app.get('/api/check-scan', (req, res) => {
  res.json({ scanned: qrScanned });
});

// Submit order (requires 2 scans)
app.post('/api/orders', async (req, res) => {
  try {
    if (!qrScanned) {
      return res.status(400).json({ message: 'QR code not scanned twice yet' });
    }

    const order = new Order(req.body);
    await order.save();

    // Reset scan count after submission
    times = 0;
    qrScanned = false;

    res.status(201).json({ message: 'Order submitted successfully', order });
  } catch (err) {
    console.error('Order submission error:', err);
    res.status(500).json({ message: 'Failed to submit order' });
  }
});

// Stock routes
app.use('/api/stock', stockRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB Atlas:', err);
  });
