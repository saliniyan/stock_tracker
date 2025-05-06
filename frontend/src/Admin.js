import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';


// Create a context for inventory management
const InventoryContext = createContext();

// Custom hook to use the inventory context
function useInventory() {
  return useContext(InventoryContext);
}

// Inventory Provider component
function InventoryProvider({ children }) {
  // Sample initial data
  const sampleStockEntries = [
    {
      id: 1,
      date: '2025-03-15',
      price: 45.99,
      spares: 4,
      totalCost: 183.96,
      companyName: 'Brake Pads',
      partNumber: 'BP-2025',
      category: 'Brakes',
      description: 'High-performance ceramic brake pads'
    }
  ];

  const [stockEntries, setStockEntries] = useState(sampleStockEntries);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedStockEntries = localStorage.getItem('carStockEntries');
    if (savedStockEntries) {
      setStockEntries(JSON.parse(savedStockEntries));
    }
  }, []);

  // Function to save inventory to localStorage
  const saveInventory = (entries) => {
    localStorage.setItem('carStockEntries', JSON.stringify(entries));
    setStockEntries(entries);
  };

  // Use useCallback to prevent infinite loops
  const refreshInventory = useCallback(() => {
    const savedStockEntries = localStorage.getItem('carStockEntries');
    if (savedStockEntries) {
      setStockEntries(JSON.parse(savedStockEntries));
    }
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

// Main App Component
function Admin() {
  return (
    <InventoryProvider>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <header style={{ borderBottom: '1px solid #ddd', paddingBottom: '20px', marginBottom: '20px' }}>
          <h1>Car Spare Parts Inventory Tracker</h1>
          <nav style={{ marginTop: '20px' }}>
            <ul style={{ display: 'flex', gap: '20px', listStyle: 'none', padding: 0 }}>
              <li>
                <Link to="/admin" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/inventory" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>Inventory</Link>
              </li>
              <li>
                <Link to="/admin/parts" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>Spare Parts</Link>
              </li>
              <li>
                <Link to="/admin/reports" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>Reports</Link>
              </li>
              <li>
                <Link to="/admin/orders" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>Orders</Link>
              </li>

            </ul>
          </nav>
        </header>

        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="parts" element={<SpareParts />} />
          <Route path="parts/:partName" element={<SparePartDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="orders" element={<Orders />} />
        </Routes>
      </div>
    </InventoryProvider>
  );
}

// Dashboard Component
function Dashboard() {
  const { stockEntries, refreshInventory } = useInventory();
  
  // Refresh data when component mounts - removed refreshInventory from dependency array
  useEffect(() => {
    refreshInventory();
  }, []);

  // Calculate summary statistics
  const calculateStats = () => {
    if (stockEntries.length === 0) return { totalParts: 0, totalCost: 0, uniqueParts: 0 };
    
    const totalParts = stockEntries.reduce((sum, entry) => sum + entry.spares, 0);
    const totalCost = stockEntries.reduce((sum, entry) => sum + entry.totalCost, 0);
    const uniqueParts = new Set(stockEntries.map(entry => entry.companyName)).size;
    
    return { totalParts, totalCost, uniqueParts };
  };

  const stats = calculateStats();

  // Get recent entries (last 5)
  const recentEntries = [...stockEntries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Group by part name for the chart data
  const partsByCompany = stockEntries.reduce((acc, entry) => {
    if (!acc[entry.companyName]) {
      acc[entry.companyName] = 0;
    }
    acc[entry.companyName] += entry.spares;
    return acc;
  }, {});

  // Top parts by quantity
  const topParts = Object.entries(partsByCompany)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <h2>Dashboard Overview</h2>
      
      {/* Summary Stats */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: '1', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Total Parts</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalParts.toFixed(0)}</p>
        </div>
        <div style={{ flex: '1', padding: '20px', backgroundColor: '#f0fff0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Total Revenue</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{stats.totalCost.toFixed(2)}</p>
        </div>
        <div style={{ flex: '1', padding: '20px', backgroundColor: '#fff0f5', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Unique Parts</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.uniqueParts}</p>
        </div>
      </div>
      
      {/* Two-column layout */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        {/* Left column - Recent Activity */}
        <div style={{ flex: '1', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Recent Activity</h3>
          {recentEntries.length > 0 ? (
            <div>
              {recentEntries.map(entry => (
                <div key={entry.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{entry.companyName}</strong>
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px' }}>
                    <span>{entry.spares} parts at {entry.price}/each</span>
                    <span>₹{entry.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Link to="/admin/inventory" style={{ color: '#4CAF50', textDecoration: 'none' }}>View All Entries →</Link>
              </div>
            </div>
          ) : (
            <p>No recent activity. Add your first spare part entry.</p>
          )}
        </div>
        
        {/* Right column - Top Parts */}
        <div style={{ flex: '1', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Top Parts by Quantity</h3>
          {topParts.length > 0 ? (
            <div>
              {topParts.map(([part, quantity], index) => (
                <div key={part} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>#{index + 1} {part}</span>
                    <span>{quantity} parts</span>
                  </div>
                  <div style={{ marginTop: '5px', backgroundColor: '#e9e9e9', borderRadius: '4px', height: '10px' }}>
                    <div 
                      style={{ 
                        width: `${(quantity / topParts[0][1]) * 100}%`, 
                        backgroundColor: '#4CAF50', 
                        height: '10px',
                        borderRadius: '4px'
                      }} 
                    />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Link to="/admin/parts" style={{ color: '#4CAF50', textDecoration: 'none' }}>View All Parts →</Link>
              </div>
            </div>
          ) : (
            <p>No parts data available. Add your first spare part entry.</p>
          )}
        </div>
      </div>
      
      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
          <Link to="/admin/inventory" style={{ 
            flex: '1', 
            padding: '15px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            textDecoration: 'none', 
            textAlign: 'center',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            Add New Spare Part
          </Link>
          <Link to="/admin/parts" style={{ 
            flex: '1', 
            padding: '15px', 
            backgroundColor: '#2196F3', 
            color: 'white', 
            textDecoration: 'none', 
            textAlign: 'center',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            View Spare Parts
          </Link>
          <Link to="/admin/reports" style={{ 
            flex: '1', 
            padding: '15px', 
            backgroundColor: '#FF9800', 
            color: 'white', 
            textDecoration: 'none', 
            textAlign: 'center',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            Generate Reports
          </Link>
        </div>
      </div>
    </div>
  );
}


function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/orders')
      .then(res => {
        if (!res.ok) throw new Error('Server error');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setError('Unexpected response format.');
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to load orders.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📦 All Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead style={{ backgroundColor: '#f5f5f5' }}>
            <tr>
              <th style={cellStyle}>Item</th>
              <th style={cellStyle}>Quantity</th>
              <th style={cellStyle}>Total (₹)</th>
              <th style={cellStyle}>Order Date</th>
              <th style={cellStyle}>Customer Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={index}>
                <td style={cellStyle}>
                  {order.productSnapshot?.name || 'N/A'}
                </td>
                <td style={cellStyle}>
                  {order.quantityOrdered}
                </td>
                <td style={cellStyle}>
                  ₹{order.orderTotal?.toFixed(2) || '0.00'}
                </td>
                <td style={cellStyle}>
                  {new Date(order.orderDate).toLocaleString()}
                </td>
                <td style={cellStyle}>
                  <strong>{order.customerDetails?.name}</strong><br />
                  {order.customerDetails?.address}<br />
                  📞 {order.customerDetails?.phone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const cellStyle = {
  border: '1px solid #ccc',
  padding: '10px',
  textAlign: 'left',
  verticalAlign: 'top',
};


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

// Reports Component
function Reports() {
  const { stockEntries, refreshInventory } = useInventory();
  const [reportType, setReportType] = useState('monthly');
  
  // Refresh data when component mounts
  useEffect(() => {
    refreshInventory();
  }, []);

  // Generate monthly report data
  const generateMonthlyReport = () => {
    const monthlyData = {};
    
    stockEntries.forEach(entry => {
      const date = new Date(entry.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          spares: 0,
          cost: 0
        };
      }
      
      monthlyData[monthYear].spares += entry.spares;
      monthlyData[monthYear].cost += entry.totalCost;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  // Generate category report data
  const generateCategoryReport = () => {
    const categoryData = {};
    
    stockEntries.forEach(entry => {
      const category = entry.category || 'Uncategorized';
      
      if (!categoryData[category]) {
        categoryData[category] = {
          name: category,
          spares: 0,
          cost: 0
        };
      }
      
      categoryData[category].spares += entry.spares;
      categoryData[category].cost += entry.totalCost;
    });
    
    return Object.values(categoryData);
  };

  // Get appropriate data based on report type
  const reportData = reportType === 'monthly' 
    ? generateMonthlyReport() 
    : generateCategoryReport();

  return (
    <div>
      <h2>Reports</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Report Type: </label>
        <select 
          value={reportType} 
          onChange={(e) => setReportType(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', marginLeft: '10px' }}
        >
          <option value="monthly">Monthly Expense Report</option>
          <option value="category">Category Expense Report</option>
        </select>
      </div>
      
      {/* Report Chart */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>{reportType === 'monthly' ? 'Monthly Expense Report' : 'Category Expense Report'}</h3>
        
        <div style={{ height: '400px', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={reportType === 'monthly' ? 'month' : 'name'} />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="spares" name="Quantity" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="cost" name="Cost (₹)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Report Table */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Report Details</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                {reportType === 'monthly' ? 'Month' : 'Category'}
              </th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total Cost (₹)</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Avg. Cost per Item (₹)</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>{reportType === 'monthly' ? item.month : item.name}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{item.spares.toFixed(0)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.cost.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>₹{(item.cost / item.spares).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>Total</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                {reportData.reduce((sum, item) => sum + item.spares, 0).toFixed(0)}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                ₹{reportData.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default Admin;