import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create a context for inventory management
const InventoryContext = createContext();

// Custom hook to use the inventory context
export function useInventory() {
  return useContext(InventoryContext);
}

export function InventoryProvider({ children }) {
  const [stockEntries, setStockEntries] = useState([]);
  
  // Fetch inventory data from MongoDB when the component mounts
  useEffect(() => {
    const fetchStockEntries = async () => {
      try {
        const response = await axios.get('https://stock-tracker-nox1.onrender.com/api/stock'); // Adjust the API route if needed
        
        // Process data to ensure totalCost is calculated for each entry
        const processedEntries = response.data.map(entry => ({
          ...entry,
          // Ensure numeric types
          price: parseFloat(entry.price || 0),
          spares: parseFloat(entry.spares || 0),
          // Calculate totalCost if it doesn't exist
          totalCost: entry.totalCost || (parseFloat(entry.price || 0) * parseFloat(entry.spares || 0))
        }));
        
        setStockEntries(processedEntries);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      }
    };
    fetchStockEntries();
  }, []);

  // Function to save inventory to MongoDB
  const saveInventory = async (entries) => {
    try {
      // Process entries to ensure totalCost is set for each one
      const processedEntries = entries.map(entry => ({
        ...entry,
        // Ensure numeric types 
        price: parseFloat(entry.price || 0),
        spares: parseFloat(entry.spares || 0),
        // Calculate totalCost
        totalCost: parseFloat(entry.price || 0) * parseFloat(entry.spares || 0)
      }));
      
      // Log what we're sending for debugging
      console.log("Sending to MongoDB:", processedEntries);
      
      const response = await axios.post('https://stock-tracker-nox1.onrender.com/api/stock', { entries: processedEntries });
      console.log("Response from server:", response.data);
      
      // Only update state if the server operation was successful
      if (response.status === 200 || response.status === 201) {
        setStockEntries(processedEntries);
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      // Add user notification here
      alert("Failed to save to database. Check console for details.");
    }
  };

  const refreshInventory = useCallback(() => {
    const fetchStockEntries = async () => {
      try {
        const response = await axios.get('https://stock-tracker-nox1.onrender.com/api/stock');
        
        // Process data to ensure totalCost is calculated for each entry
        const processedEntries = response.data.map(entry => ({
          ...entry,
          // Ensure numeric types
          price: parseFloat(entry.price || 0),
          spares: parseFloat(entry.spares || 0),
          // Calculate totalCost if it doesn't exist
          totalCost: entry.totalCost || (parseFloat(entry.price || 0) * parseFloat(entry.spares || 0))
        }));
        
        setStockEntries(processedEntries);
      } catch (error) {
        console.error('Error refreshing inventory data:', error);
      }
    };
    fetchStockEntries();
  }, []);

  // Value object to be provided by the context
  const value = {
    stockEntries,
    setStockEntries,
    saveInventory,
    refreshInventory
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}