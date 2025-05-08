import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

function QRDisplay({ onScan, onCancel }) {
  const [countdown, setCountdown] = useState(60); // Extended to 60 seconds
  const [scanStatus, setScanStatus] = useState("waiting"); // "waiting", "scanned", "timeout"

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0 && scanStatus === "waiting") {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && scanStatus === "waiting") {
      setScanStatus("timeout");
    }
  }, [countdown, scanStatus]);

  // Check for scan status periodically
  useEffect(() => {
    // Only check if we're still waiting for a scan
    if (scanStatus !== "waiting") return;
    
    const checkScanStatus = async () => {
      try {
        const res = await axios.get('https://stock-tracker-nox1.onrender.com/api/check-scan');
        if (res.data.scanned) {
          setScanStatus("scanned");
        }
      } catch (err) {
        console.error('Error checking scan status:', err);
      }
    };

    const interval = setInterval(checkScanStatus, 2000);
    return () => clearInterval(interval);
  }, [scanStatus]);

  // Trigger appropriate action when status changes
  useEffect(() => {
    if (scanStatus === "scanned") {
      onScan(true); // Proceed with successful scan
    } else if (scanStatus === "timeout") {
      onCancel("QR code scan timed out. Please try again.");
    }
  }, [scanStatus, onScan, onCancel]);

  return (
    <div style={{ 
      textAlign: 'center', 
      backgroundColor: '#f0f8ff', 
      padding: '20px', 
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <h3>Scan to Confirm Order</h3>
      <QRCodeSVG value="https://stock-tracker-nox1.onrender.com/" size={200} />
      <p style={{ marginTop: '15px' }}>
        {scanStatus === "waiting" ? 
          `Time remaining: ${countdown} seconds` : 
          scanStatus === "scanned" ? 
            "Scan confirmed! Processing order..." : 
            "Time expired. Returning to form..."
        }
      </p>
      <button 
        onClick={() => onCancel("QR code scan canceled.")}
        style={{
          padding: '8px 15px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          marginTop: '15px',
          cursor: 'pointer'
        }}
      >
        Cancel
      </button>
    </div>
  );
}

function User() {
  const [stockEntries, setStockEntries] = useState([]);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [orderHistory, setOrderHistory] = useState([]);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
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
    // Fetch inventory data from MongoDB
    const fetchInventory = async () => {
      try {
        const res = await fetch('https://stock-tracker-nox1.onrender.com/api/stock');
        if (res.ok) {
          const stockEntries = await res.json();
          setStockEntries(stockEntries);
        } else {
          console.error('Failed to fetch inventory data');
        }
      } catch (err) {
        console.error('Error fetching inventory:', err);
      }
    };

    // Fetch order history from MongoDB
    const fetchOrderHistory = async () => {
      try {
        const res = await fetch('https://stock-tracker-nox1.onrender.com/api/orders');
        if (res.ok) {
          const orderHistory = await res.json();
          setOrderHistory(orderHistory);
        } else {
          console.error('Failed to fetch order history');
        }
      } catch (err) {
        console.error('Error fetching order history:', err);
      }
    };

    fetchInventory();
    fetchOrderHistory();
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
    setShowQR(false); // Ensure QR is hidden when opening the form
    setStatusMessage(""); // Clear any previous status messages
  };

  const handleQRScan = (success) => {
    if (success) {
      submitOrder(); // Only proceed with order if scan was successful
    } else {
      setShowQR(false); // Hide QR if not successful
      setStatusMessage("QR code scan failed. Please try again.");
    }
  };

  const handleQRCancel = (message) => {
    setShowQR(false);
    setStatusMessage(message || "QR code scan canceled.");
  };

  const handleRequestQR = () => {
    if (!validateForm()) return;
    
    // Reset any QR scan status on the server before showing the QR
    resetScanStatus().then(() => {
      setStatusMessage("");
      setShowQR(true); // Show QR code when form is valid
    });
  };

  // New function to reset scan status on the server
  const resetScanStatus = async () => {
    try {
      await axios.post('https://stock-tracker-nox1.onrender.com/api/reset-scan');
      return true;
    } catch (err) {
      console.error('Error resetting scan status:', err);
      return false;
    }
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
    
    // Check if quantity is entered
    const qty = parseInt(orderQuantities[currentItemId]);
    if (isNaN(qty) || qty <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitOrder = async () => {
    const qty = parseInt(orderQuantities[currentItemId]);
    
    // Double check quantity (should already be validated, but just in case)
    if (isNaN(qty) || qty <= 0) {
      setStatusMessage('Please enter a valid quantity.');
      setShowQR(false);
      return;
    }

    const item = stockEntries.find(entry => entry._id === currentItemId);
    if (!item || item.spares < qty) {
      setStatusMessage(`Only ${item?.spares || 0} items available.`);
      setShowQR(false);
      return;
    }

    const order = {
      productId: currentItemId,
      quantity: qty,
      customerDetails,
    };

    try {
      const res = await fetch('https://stock-tracker-nox1.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (res.ok) {
        alert('Order placed successfully!');
        setShowForm(false);
        setShowQR(false);
        setCustomerDetails({ name: '', address: '', phone: '' });

        // Update inventory after order is placed
        const updatedEntries = stockEntries.map(entry =>
          entry._id === currentItemId
            ? { ...entry, spares: entry.spares - qty }
            : entry
        );

        setStockEntries(updatedEntries);
        
        // Refresh order history
        const orderRes = await fetch('https://stock-tracker-nox1.onrender.com/api/orders');
        if (orderRes.ok) {
          const updatedOrderHistory = await orderRes.json();
          setOrderHistory(updatedOrderHistory);
        }
      } else {
        const errorData = await res.json();
        setStatusMessage(`Failed to place order: ${errorData.message}`);
        setShowQR(false);
      }
    } catch (err) {
      console.error('Order error:', err);
      setStatusMessage('An error occurred while placing the order.');
      setShowQR(false);
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
    <div>
    <Navbar />
    <br />
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
                  key={entry._id} 
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
                        value={orderQuantities[entry._id] || ''}
                        onChange={(e) => handleInputChange(entry._id, e.target.value)}
                        style={{ width: '60px', marginRight: '10px', padding: '5px' }}
                        disabled={entry.spares <= 0}
                      />
                      <button
                        onClick={() => handleOrder(entry._id)}
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

          {/* Customer Details Modal */}
          {showForm && (
            <div style={modalStyle}>
              <div style={modalContentStyle}>
                <h2 style={{ marginBottom: '20px', color: '#333' }}>🧾 Enter Customer Details</h2>

                {showQR ? (
                  <QRDisplay onScan={handleQRScan} onCancel={handleQRCancel} />
                ) : (
                  <>
                    {statusMessage && (
                      <div style={{ 
                        padding: '10px', 
                        backgroundColor: '#ffebee', 
                        borderRadius: '5px',
                        marginBottom: '15px',
                        color: '#d32f2f'
                      }}>
                        {statusMessage}
                      </div>
                    )}
                
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
                    
                    {errors.quantity && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{errors.quantity}</div>}

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                      <button style={submitButtonStyle} onClick={handleRequestQR}>✅ Submit Order</button>
                      <button style={cancelButtonStyle} onClick={() => setShowForm(false)}>❌ Cancel</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default User;