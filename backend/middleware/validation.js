/**
 * Middleware for validating stock entry data
 */
const validateStockEntry = (req, res, next) => {
    const { entries } = req.body;
    
    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ 
        message: 'Invalid request format. Expected an array of entries.' 
      });
    }
    
    // Validate each entry in the array
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      // Check required fields
      if (!entry.id || !entry.date || !entry.companyName) {
        return res.status(400).json({
          message: `Entry at index ${i} is missing required fields (id, date, or companyName)`,
          entry
        });
      }
      
      // Convert numeric fields and calculate totalCost
      entries[i] = {
        ...entry,
        price: parseFloat(entry.price || 0),
        spares: parseFloat(entry.spares || 0),
        totalCost: parseFloat(entry.price || 0) * parseFloat(entry.spares || 0)
      };
    }
    
    next();
  };
  
  /**
   * Middleware for validating order data
   */
  const validateOrderData = (req, res, next) => {
    const { productId, quantity, customerDetails } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    if (!customerDetails) {
      return res.status(400).json({ message: 'Customer details are required' });
    }
    
    if (!customerDetails.name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }
    
    next();
  };
  
  module.exports = {
    validateStockEntry,
    validateOrderData
  };