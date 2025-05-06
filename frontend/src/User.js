import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import mongoose from 'mongoose'; // add this import if you don't already have it

function User() {
  const [stockEntries, setStockEntries] = useState([]);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [orderHistory, setOrderHistory] = useState([]);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
const [currentItemId, setCurrentItemId] = useState(null);
const [errors, setErrors] = useState({});
const [customerDetails, setCustomerDetails] = useState({
  name: '',
  address: '',
  phone: ''
});
const modalStyle = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100%', height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  minWidth: '300px',
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
};

const inputStyle = {
  padding: '12px',
  marginBottom: '12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '16px',
  outline: 'none',
};

const submitButtonStyle = {
  flex: 1,
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const cancelButtonStyle = {
  flex: 1,
  padding: '10px 20px',
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

  
  useEffect(() => {
    // Load inventory data
    const savedStockEntries = localStorage.getItem('carStockEntries');
    if (savedStockEntries) {
      setStockEntries(JSON.parse(savedStockEntries));
    }
    
    // Load order history
    const savedOrderHistory = localStorage.getItem('orderHistory');
    if (savedOrderHistory) {
      setOrderHistory(JSON.parse(savedOrderHistory));
    }
  }, []);

  const handleInputChange = (id, value) => {
    setOrderQuantities({
      ...orderQuantities,
      [id]: value
    });
  };

  const handleOrder = (id) => {
    setCurrentItemId(id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    submitOrder(); // your existing logic
  };

  const validateForm = () => {
    const newErrors = {};
    if (!customerDetails.name.trim()) newErrors.name = 'Name is required';
    if (!customerDetails.address.trim()) newErrors.address = 'Address is required';
    if (!customerDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(customerDetails.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const submitOrder = async () => {
    const qty = parseInt(orderQuantities[currentItemId]);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }
  
    const item = stockEntries.find(entry => entry.id === currentItemId);
    if (!item || item.spares < qty) {
      alert(`Only ${item?.spares || 0} items available.`);
      return;
    }
  
    const order = {
      itemId: new mongoose.Types.ObjectId(currentItemId),
      quantityOrdered: qty,
      orderDate: new Date().toISOString(), // Optional if the backend defaults it
      orderTotal: qty * item.price,
      customerDetails,
      productSnapshot: {
        name: item.companyName,
        price: item.price,
        description: item.description || '',
      }
    };    
  
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
  
      if (res.ok) {
        alert('Order placed!');
        setShowForm(false);
        setCustomerDetails({ name: '', address: '', phone: '' });
  
        const updatedEntries = stockEntries.map(entry =>
          entry.id === currentItemId
            ? { ...entry, spares: entry.spares - qty }
            : entry
        );
  
        setStockEntries(updatedEntries);
        localStorage.setItem('carStockEntries', JSON.stringify(updatedEntries));
      } else {
        alert('Failed to place order.');
      }
    } catch (err) {
      console.error('Order error:', err);
      alert('An error occurred while placing the order.');
    }
  };
  
  // Filter stock entries based on search input
  const filteredEntries = stockEntries.filter(entry => 
    filter === '' || 
    entry.companyName.toLowerCase().includes(filter.toLowerCase()) ||
    (entry.category && entry.category.toLowerCase().includes(filter.toLowerCase()))
  );
  
  // Group parts by category for the sidebar
  const categoriesMap = stockEntries.reduce((acc, entry) => {
    const category = entry.category || 'Uncategorized';
    if (!acc[category]) acc[category] = 0;
    acc[category] += 1;
    return acc;
  }, {});
  
  const categories = Object.entries(categoriesMap)
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #ddd', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1>Car Spare Parts Store</h1>
        <p>Find and order the parts you need for your vehicle</p>
      </header>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Sidebar - Categories */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f9f9f9', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3>Categories</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
              <li 
                onClick={() => setFilter('')}
                style={{ 
                  padding: '8px 5px',
                  cursor: 'pointer',
                  backgroundColor: filter === '' ? '#e9e9e9' : 'transparent',
                  borderRadius: '4px',
                  marginBottom: '5px'
                }}
              >
                All Parts ({stockEntries.length})
              </li>
              {categories.map(([category, count]) => (
                <li 
                  key={category}
                  onClick={() => setFilter(category)}
                  style={{ 
                    padding: '8px 5px',
                    cursor: 'pointer',
                    backgroundColor: filter === category ? '#e9e9e9' : 'transparent',
                    borderRadius: '4px',
                    marginBottom: '5px'
                  }}
                >
                  {category} ({count})
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Links */}
          
        </div>
        
        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Search/Filter Bar */}
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f9f9f9', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <input
              type="text"
              placeholder="Search parts by name or category..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          
          {/* Products Grid */}
          <h2>Available Spare Parts</h2>
          {filteredEntries.length === 0 ? (
            <p>No parts available matching your criteria.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {filteredEntries.map(entry => (
                <div 
                  key={entry.id} 
                  style={{ 
                    padding: '15px', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <h3>{entry.companyName}</h3>
                  <div style={{ 
                    backgroundColor: '#e9e9e9', 
                    padding: '3px 8px', 
                    borderRadius: '4px', 
                    fontSize: '14px',
                    display: 'inline-block',
                    marginBottom: '10px'
                  }}>
                    {entry.category || 'Uncategorized'}
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#666', margin: '10px 0' }}>
                    {entry.description || 'No description available'}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '15px'
                  }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{entry.price.toFixed(2)}</div>
                      <div style={{ fontSize: '14px', color: entry.spares > 0 ? '#4CAF50' : '#f44336' }}>
                        {entry.spares > 0 ? `${entry.spares} in stock` : 'Out of stock'}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        max={entry.spares}
                        value={orderQuantities[entry.id] || ''}
                        onChange={(e) => handleInputChange(entry.id, e.target.value)}
                        style={{ width: '60px', marginRight: '10px', padding: '5px' }}
                        disabled={entry.spares <= 0}
                      />
                      <button
                        onClick={() => handleOrder(entry.id)}
                        disabled={entry.spares <= 0}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: entry.spares > 0 ? '#4CAF50' : '#cccccc',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: entry.spares > 0 ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {showForm && (
          <div style={modalStyle}>
            <div style={modalContentStyle}>
              <h2 style={{ marginBottom: '20px', color: '#333' }}>🧾 Enter Customer Details</h2>

              <input
                type="text"
                placeholder="Name"
                value={customerDetails.name}
                onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                style={inputStyle}
              />
              {errors.name && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{errors.name}</div>}

              <input
                type="text"
                placeholder="Address"
                value={customerDetails.address}
                onChange={e => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                style={inputStyle}
              />
              {errors.address && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{errors.address}</div>}

              <input
                type="text"
                placeholder="Phone"
                value={customerDetails.phone}
                onChange={e => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                style={inputStyle}
              />
              {errors.phone && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{errors.phone}</div>}

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <button style={submitButtonStyle} onClick={handleSubmit}>✅ Submit Order</button>
                <button style={cancelButtonStyle} onClick={() => setShowForm(false)}>❌ Cancel</button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

export default User;