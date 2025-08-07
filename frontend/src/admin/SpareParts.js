import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from './InventoryContext';

// Spare Parts Component
function SpareParts() {
  const { stockEntries, refreshInventory } = useInventory();
  const navigate = useNavigate();
  
  // Refresh data when component mounts - removed refreshInventory from dependency array
  useEffect(() => {
    refreshInventory();
  }, []);

  // Group by part name
  const partsSummary = stockEntries.reduce((acc, entry) => {
    const key = entry.companyName;
    if (!acc[key]) {
      acc[key] = {
        name: entry.companyName,
        totalQuantity: 0,
        totalCost: 0,
        avgPrice: 0,
        category: entry.category || 'N/A',
        latestPrice: 0,
        latestDate: null,
        entries: []
      };
    }
    
    acc[key].totalQuantity += entry.spares;
    acc[key].totalCost += entry.totalCost;
    acc[key].entries.push(entry);
    
    // Check if this is a newer entry
    const entryDate = new Date(entry.date);
    if (!acc[key].latestDate || entryDate > new Date(acc[key].latestDate)) {
      acc[key].latestDate = entry.date;
      acc[key].latestPrice = entry.price;
    }
    
    return acc;
  }, {});
  
  // Calculate average prices
  Object.values(partsSummary).forEach(part => {
    part.avgPrice = part.totalCost / part.totalQuantity;
  });
  
  // Convert to array and sort by total quantity
  const partsArray = Object.values(partsSummary).sort((a, b) => b.totalQuantity - a.totalQuantity);
  
  // Handle click on a part
  const handlePartClick = (partName) => {
    navigate(`/admin/parts/${encodeURIComponent(partName)}`);
  };

  // Group by category for summary
  const categorySummary = partsArray.reduce((acc, part) => {
    const category = part.category;
    if (!acc[category]) {
      acc[category] = {
        totalQuantity: 0,
        totalCost: 0,
        partCount: 0
      };
    }
    
    acc[category].totalQuantity += part.totalQuantity;
    acc[category].totalCost += part.totalCost;
    acc[category].partCount += 1;
    
    return acc;
  }, {});

  return (
    <div>
      <h2>Spare Parts Catalog</h2>
      
      {/* Category Summary */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Categories Summary</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {Object.entries(categorySummary).map(([category, data]) => (
            <div key={category} style={{ 
              flex: '1 1 200px',
              padding: '15px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>{category}</h4>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>
                <div><strong>Parts:</strong> {data.partCount}</div>
                <div><strong>Quantity:</strong> {data.totalQuantity.toFixed(0)}</div>
                <div><strong>Total Cost:</strong> ₹{data.totalCost.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Parts List */}
      <div>
        <h3>Parts Inventory</h3>
        {partsArray.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {partsArray.map(part => (
              <div 
                key={part.name} 
                style={{ 
                  padding: '15px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
                onClick={() => handlePartClick(part.name)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: '0' }}>{part.name}</h4>
                  <span style={{ 
                    backgroundColor: '#e9e9e9', 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontSize: '14px' 
                  }}>
                    {part.category}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <div>
                    <div><strong>Total Quantity:</strong> {part.totalQuantity.toFixed(0)}</div>
                    <div><strong>Average Price:</strong> ₹{part.avgPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div><strong>Total Cost:</strong> ₹{part.totalCost.toFixed(2)}</div>
                    <div><strong>Latest Price:</strong> ₹{part.latestPrice.toFixed(2)} ({new Date(part.latestDate).toLocaleDateString()})</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No spare parts found. Add your first inventory entry!</p>
        )}
      </div>
    </div>
  );
}

export default SpareParts;