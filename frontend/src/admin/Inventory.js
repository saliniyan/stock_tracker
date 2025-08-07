import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from './InventoryContext';

// Inventory Component
function Inventory() {
  const { stockEntries, saveInventory, refreshInventory } = useInventory();
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().substr(0, 10),
    price: '',
    spares: '',
    companyName: '',
    partNumber: '',
    category: '',
    description: ''
  });
  const [filter, setFilter] = useState('all');
  
  // Refresh data when component mounts - removed refreshInventory from dependency array
  useEffect(() => {
    refreshInventory();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({
      ...newEntry,
      [name]: value
    });
  };

  // Add a new stock entry
  const addStockEntry = (e) => {
    e.preventDefault();
    
    if (!newEntry.companyName || !newEntry.price || !newEntry.spares) {
      alert('Please fill in all required fields');
      return;
    }

    const entryWithId = {
      ...newEntry,
      id: Date.now(),
      price: parseFloat(newEntry.price),
      spares: parseFloat(newEntry.spares),
      totalCost: parseFloat(newEntry.price) * parseFloat(newEntry.spares)
    };

    saveInventory([...stockEntries, entryWithId]);
    
    // Reset form
    setNewEntry({
      date: new Date().toISOString().substr(0, 10),
      price: '',
      spares: '',
      companyName: newEntry.companyName, // Keep the company name for convenience
      partNumber: '',
      category: newEntry.category, // Keep the category for convenience
      description: ''
    });
  };

  // Delete a stock entry
  const deleteEntry = (id) => {
    saveInventory(stockEntries.filter(entry => entry.id !== id));
  };

  // Filter entries by company name
  const filteredEntries = filter === 'all' 
    ? stockEntries 
    : stockEntries.filter(entry => entry.companyName === filter);

  // Get unique company names for filter dropdown
  const companies = [...new Set(stockEntries.map(entry => entry.companyName))];

  // Calculate summary statistics
  const calculateStats = (entries) => {
    if (entries.length === 0) return { totalSpares: 0, totalCost: 0, avgPrice: 0 };
    
    const totalSpares = entries.reduce((sum, entry) => sum + entry.spares, 0);
    const totalCost = entries.reduce((sum, entry) => sum + entry.totalCost, 0);
    const avgPrice = totalCost / totalSpares;
    
    return { totalSpares, totalCost, avgPrice };
  };

  const stats = calculateStats(filteredEntries);

  // Sort entries by date (newest first)
  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div>
      <h2>Inventory Management</h2>
      
      <div className="dashboard" style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Inventory Dashboard</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="stat-box" style={{ flex: 1, padding: '15px', margin: '0 10px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4>Total Spares</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalSpares.toFixed(2)}</p>
          </div>
          <div className="stat-box" style={{ flex: 1, padding: '15px', margin: '0 10px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4>Total Cost</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{stats.totalCost.toFixed(2)}</p>
          </div>
          <div className="stat-box" style={{ flex: 1, padding: '15px', margin: '0 10px', backgroundColor: '#fff', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h4>Average Price</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{stats.avgPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="form-container" style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h3>Add New Spare Part Entry</h3>
        <form onSubmit={addStockEntry} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label>Spare Part Name/Model: *</label>
            <input
              type="text"
              name="companyName"
              value={newEntry.companyName}
              onChange={handleInputChange}
              placeholder="e.g., Brake Pad"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label>Part Number:</label>
            <input
              type="text"
              name="partNumber"
              value={newEntry.partNumber}
              onChange={handleInputChange}
              placeholder="e.g., BP-2023"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label>Category:</label>
            <select
              name="category"
              value={newEntry.category}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Select Category</option>
              <option value="Engine">Engine</option>
              <option value="Brakes">Brakes</option>
              <option value="Transmission">Transmission</option>
              <option value="Suspension">Suspension</option>
              <option value="Electrical">Electrical</option>
              <option value="Body">Body</option>
              <option value="Interior">Interior</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label>Date: *</label>
            <input
              type="date"
              name="date"
              value={newEntry.date}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label>Price per spare (₹): *</label>
            <input
              type="number"
              name="price"
              value={newEntry.price}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label>Quantity: *</label>
            <input
              type="number"
              name="spares"
              value={newEntry.spares}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="1"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <div style={{ flex: '1 1 100%' }}>
            <label>Description:</label>
            <textarea
              name="description"
              value={newEntry.description}
              onChange={handleInputChange}
              placeholder="Enter any additional details about this spare part"
              style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
            />
          </div>
          <div style={{ flex: '1 1 100%', textAlign: 'right' }}>
            <button 
              type="submit" 
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add Entry
            </button>
          </div>
        </form>
      </div>
      
      <div className="history-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Inventory History</h3>
          <div>
            <label>Filter by Part: </label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px' }}
            >
              <option value="all">All Parts</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>
        
        {sortedEntries.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Part Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Category</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Price (₹)</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Quantity</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total Cost (₹)</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map(entry => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{entry.date}</td>
                  <td style={{ padding: '12px' }}>
                    <Link to={`/admin/parts/${encodeURIComponent(entry.companyName)}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                      {entry.companyName}
                    </Link>
                  </td>
                  <td style={{ padding: '12px' }}>{entry.category || 'N/A'}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>₹{entry.price.toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{entry.spares.toFixed(0)}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>₹{entry.totalCost.toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      style={{ 
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No inventory entries found. Add your first entry above!</p>
        )}
      </div>
    </div>
  );
}

export default Inventory;