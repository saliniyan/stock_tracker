const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orderRoutes'); // Adjust the path if needed

// Initialize Express app
const app = express();

// Use middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies
app.use('/api/orders', orderRoutes);

mongoose.connect('mongodb+srv://saliniyan:saliniyan@cluster0.tp4v7al.mongodb.net/consiltency?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.log('Error connecting to MongoDB Atlas: ', err));


// Basic route (ensure this is correct)
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// Define your routes here
// For example:
app.get('/api/parts', (req, res) => {
  // Respond with spare parts data (replace with actual logic)
  res.json({ message: 'List of spare parts' });
});

// Set the server to listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
