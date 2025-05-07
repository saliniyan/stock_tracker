const express = require('express');
const router = express.Router();
const Stock = require('../models/stockModel');
const { validateStockEntry } = require('../middleware/validation');

// Get all stock entries
router.get('/', async (req, res) => {
  try {
    const stockEntries = await Stock.find();
    res.json(stockEntries);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ message: 'Error fetching stock data', error: error.message });
  }
});

// Add new stock entries or update all
router.post('/', validateStockEntry, async (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ message: 'Invalid request format. Expected an array of entries.' });
    }

    // Clear existing records and insert new ones
    await Stock.deleteMany({});
    const savedEntries = await Stock.insertMany(entries);
    
    res.status(201).json({ 
      message: 'Stock entries saved successfully',
      count: savedEntries.length
    });
  } catch (error) {
    console.error('Error saving stock entries:', error);
    res.status(500).json({ message: 'Error saving stock entries', error: error.message });
  }
});

// Get stock entry by ID
router.get('/:id', async (req, res) => {
  try {
    const stockEntry = await Stock.findOne({ id: req.params.id });
    if (!stockEntry) {
      return res.status(404).json({ message: 'Stock entry not found' });
    }
    res.json(stockEntry);
  } catch (error) {
    console.error('Error fetching stock entry:', error);
    res.status(500).json({ message: 'Error fetching stock entry', error: error.message });
  }
});

// Delete stock entry by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await Stock.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Stock entry not found' });
    }
    res.json({ message: 'Stock entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock entry:', error);
    res.status(500).json({ message: 'Error deleting stock entry', error: error.message });
  }
});

// Get entries by company name
router.get('/company/:name', async (req, res) => {
  try {
    const stockEntries = await Stock.find({ 
      companyName: decodeURIComponent(req.params.name) 
    });
    res.json(stockEntries);
  } catch (error) {
    console.error('Error fetching stock entries by company:', error);
    res.status(500).json({ message: 'Error fetching stock entries', error: error.message });
  }
});

// Get entries by category
router.get('/category/:name', async (req, res) => {
  try {
    const stockEntries = await Stock.find({ 
      category: decodeURIComponent(req.params.name) 
    });
    res.json(stockEntries);
  } catch (error) {
    console.error('Error fetching stock entries by category:', error);
    res.status(500).json({ message: 'Error fetching stock entries', error: error.message });
  }
});

module.exports = router;