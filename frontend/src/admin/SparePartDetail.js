import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useInventory } from './InventoryContext';

// SparePartDetail Component
function SparePartDetail() {
  const { partName } = useParams();
  const { stockEntries, refreshInventory } = useInventory();
  const navigate = useNavigate();
  
  // Refresh data when component mounts
  useEffect(() => {
    refreshInventory();
  }, []);

  // Filter entries for this part
  const partEntries = stockEntries.filter(entry => 
    entry.companyName === decodeURIComponent(partName)
  );
  
  // If no entries found
  if (partEntries.length === 0) {
    return (
      <div>
        <button 
          onClick={() => navigate('/admin/parts')} 
          style={{ 
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Parts
        </button>
        <p>No parts found with name: {decodeURIComponent(partName)}</p>
      </div>
    );
  }

  // Calculate stats
  const totalQuantity = partEntries.reduce((sum, entry) => sum + entry.spares, 0);
  const totalCost = partEntries.reduce((sum, entry) => sum + entry.totalCost, 0);
  const avgPrice = totalCost / totalQuantity;
  
  // Sort entries by date (newest first)
  const sortedEntries = [...partEntries].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  // First entry is used for part details
  const latestEntry = sortedEntries[0];
  
  // Prepare data for the price history chart
  const priceHistoryData = [...sortedEntries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(entry => ({
      date: entry.date,
      price: entry.price
    }));

  return (
    <div>
      <button 
        onClick={() => navigate('/admin/parts')} 
        style={{ 
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ← Back to Parts
      </button>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>{decodeURIComponent(partName)} Details</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h3>Part Information</h3>
            <div style={{ marginTop: '10px' }}>
              <p><strong>Part Number:</strong> {latestEntry.partNumber || 'N/A'}</p>
              <p><strong>Category:</strong> {latestEntry.category || 'N/A'}</p>
              <p><strong>Description:</strong> {latestEntry.description || 'No description available.'}</p>
            </div>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <h3>Inventory Summary</h3>
            <div style={{ marginTop: '10px' }}>
              <p><strong>Current Stock:</strong> {totalQuantity.toFixed(0)} units</p>
              <p><strong>Average Price:</strong> ₹{avgPrice.toFixed(2)}</p>
              <p><strong>Total Investment:</strong> ₹{totalCost.toFixed(2)}</p>
              <p><strong>Latest Price:</strong> ₹{latestEntry.price.toFixed(2)} (as of {latestEntry.date})</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Price History Chart */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Price History</h3>
        <div style={{ height: '300px', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#2196F3" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Transaction History */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Transaction History</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Unit Price (₹)</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map(entry => (
              <tr key={entry.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>{entry.date}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{entry.spares.toFixed(0)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>₹{entry.price.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>₹{entry.totalCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SparePartDetail;