import React, { useState, useEffect } from 'react';

const cellStyle = {
  border: '1px solid #ccc',
  padding: '10px',
  textAlign: 'left',
  verticalAlign: 'top',
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://stock-tracker-nox1.onrender.com/api/orders')
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

export default Orders;