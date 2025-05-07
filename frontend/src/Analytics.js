import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  const [stockEntries, setStockEntries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stockRes, ordersRes] = await Promise.all([
          fetch('http://localhost:5000/api/stock'),
          fetch('http://localhost:5000/api/orders')
        ]);

        if (!stockRes.ok || !ordersRes.ok) throw new Error('Error fetching data');

        const stockData = await stockRes.json();
        const ordersData = await ordersRes.json();

        setStockEntries(stockData);
        setOrders(ordersData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Top Ordered Products
  const getTopOrderedProducts = () => {
    const productMap = {};
    orders.forEach(order => {
      const name = order.productSnapshot?.name || 'Unnamed';
      if (!productMap[name]) {
        productMap[name] = {
          name,
          count: 0,
          totalRevenue: 0
        };
      }
      productMap[name].count += order.quantityOrdered;
      productMap[name].totalRevenue += order.orderTotal;
    });

    return Object.values(productMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Orders by Category
  const getCategoryDistribution = () => {
    const categoryMap = {};
    orders.forEach(order => {
      const cat = order.productSnapshot?.category || 'Uncategorized';
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat] += 1;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Total Revenue
  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + (order.orderTotal || 0), 0);
  };

  // Product Availability (Ordered vs Stock)
  const getAvailabilityData = () => {
    const orderCounts = {};
    orders.forEach(order => {
      const name = order.productSnapshot?.name || 'Unnamed';
      if (!orderCounts[name]) orderCounts[name] = 0;
      orderCounts[name] += order.quantityOrdered;
    });
    // Orders Over Time (Line Chart)
const getOrderTrendData = () => {
    const trendMap = {};
    orders.forEach(order => {
      const date = new Date(order.dateOrdered || order.createdAt).toLocaleDateString();
      if (!trendMap[date]) trendMap[date] = 0;
      trendMap[date] += 1;
    });
  
    return Object.entries(trendMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  

    const availability = stockEntries.map(stock => {
      const name = stock.companyName || 'Unnamed';
      return {
        name,
        stock: stock.spares || 0,
        ordered: orderCounts[name] || 0
      };
    });

    return availability.filter(item => item.stock > 0 || item.ordered > 0);
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Loading analytics...</h2>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
      <h2>Error</h2>
      <p>{error}</p>
    </div>
  );

  if (orders.length === 0 && stockEntries.length === 0) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>No Data Found</h2>
    </div>
  );

  return (
    <div style={{ padding: '30px' }}>
      <h2>User-Friendly Analytics</h2>
      <p><strong>Total Revenue:</strong> ₹{getTotalRevenue().toFixed(2)}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {/* Chart 1: Top Ordered Products */}
        <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '10px' }}>
          <h3>Top Ordered Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getTopOrderedProducts()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Quantity Ordered" fill="#8884d8" />
              <Bar dataKey="totalRevenue" name="Revenue (₹)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Orders by Category */}
        <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '10px' }}>
          <h3>Orders by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getCategoryDistribution()}
                cx="50%"
                cy="50%"
                labelLine
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {getCategoryDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} orders`, 'Category']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Product Availability */}
        <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '10px' }}>
          <h3>Product Availability</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getAvailabilityData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" name="Available Stock" fill="#00C49F" />
              <Bar dataKey="ordered" name="Ordered" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
      </div>
    </div>
  );
};

export default Analytics;
