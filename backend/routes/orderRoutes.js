const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Adjust the path if needed

// @route   POST /api/orders
// @desc    Save a new order
router.post('/', async (req, res) => {
  try {
    console.log('Incoming order body:', req.body); // Add this line

    const { itemId, quantityOrdered, orderDate, orderTotal, customerDetails, productSnapshot } = req.body;

    if (!itemId || !quantityOrdered || !orderTotal || !customerDetails || !productSnapshot) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const newOrder = new Order({
      itemId,
      quantityOrdered,
      orderDate: orderDate || new Date(),
      orderTotal,
      customerDetails,
      productSnapshot,
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order saved successfully' });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ error: 'Failed to save order' });
  }
});



// @route   GET /api/orders
// @desc    Get all orders
// @access  Public
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find(); // Find all orders in the Order collection
    res.status(200).json(orders); // Respond with all orders
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});



module.exports = router;
