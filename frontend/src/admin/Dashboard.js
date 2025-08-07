import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from './InventoryContext';

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

export default Dashboard;