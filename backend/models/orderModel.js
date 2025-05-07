const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productSnapshot: {
    name: String,
    partNumber: String,
    category: String,
    price: Number
  },
  quantityOrdered: {
    type: Number,
    required: true
  },
  orderTotal: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  customerDetails: {
    name: {
      type: String,
      required: true
    },
    address: String,
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);