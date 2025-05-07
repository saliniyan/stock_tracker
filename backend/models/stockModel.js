const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  date: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  spares: {
    type: Number,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  partNumber: {
    type: String
  },
  category: {
    type: String
  },
  description: {
    type: String
  },
  totalCost: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);