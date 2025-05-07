const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const Stock = require('../models/stockModel');
const { validateOrderData } = require('../middleware/validation');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Create a new order
router.post('/', validateOrderData, async (req, res) => {
  try {
    const { productId, quantity, customerDetails } = req.body;
    
    if (!productId || !quantity || !customerDetails) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Find the product in stock
    const product = await Stock.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if enough stock is available
    if (product.spares < quantity) {
      return res.status(400).json({ 
        message: 'Not enough stock available',
        available: product.spares,
        requested: quantity
      });
    }
    
    // Create order with product snapshot
    const order = new Order({
      productSnapshot: {
        name: product.companyName,
        partNumber: product.partNumber,
        category: product.category,
        price: product.price
      },
      quantityOrdered: quantity,
      orderTotal: product.price * quantity,
      customerDetails
    });
    
    // Save the order
    const savedOrder = await order.save();
    
    // Update the stock quantity
    product.spares -= quantity;
    product.totalCost = product.price * product.spares;
    await product.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

// Cancel an order (restore stock)
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only allow cancellation if order is not already delivered
    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel delivered orders' });
    }
    
    // Find the product to restore stock
    const product = await Stock.findOne({ 
      companyName: order.productSnapshot.name,
      partNumber: order.productSnapshot.partNumber 
    });
    
    if (product) {
      // Restore stock quantity
      product.spares += order.quantityOrdered;
      product.totalCost = product.price * product.spares;
      await product.save();
    }
    
    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();
    
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
});

module.exports = router;