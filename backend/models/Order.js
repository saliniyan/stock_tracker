const mongoose = require('mongoose');

// Define the product snapshot schema to store product details
const productSnapshotSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: { type: String, default: '' }, // Default to empty string if no description
});

// Define the main order schema
const orderSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Assuming 'Product' is another model
  quantityOrdered: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now }, // Defaults to current date if not provided
  orderTotal: { type: Number, required: true },
  customerDetails: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
  },
  productSnapshot: { type: productSnapshotSchema, required: true }, // Snapshot of product details
});

// Create and export the Order model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
