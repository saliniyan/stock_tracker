import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  const quotes = [
  "Quality means doing it right when no one is looking. – Henry Ford",
  "An investment in knowledge pays the best interest. – Benjamin Franklin",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. – Winston Churchill",
  "Do something today that your future self will thank you for.",
  "Great things are done by a series of small things brought together. – Vincent Van Gogh"
];
const [currentQuote, setCurrentQuote] = useState(quotes[0]);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentQuote(prev => {
      const currentIndex = quotes.indexOf(prev);
      const nextIndex = (currentIndex + 1) % quotes.length;
      return quotes[nextIndex];
    });
  }, 5000); // change every 5 seconds
  return () => clearInterval(interval);
}, []);


  const [stockEntries, setStockEntries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = useMemo(
    () => ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'],
    []
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [stockRes, ordersRes] = await Promise.all([
        fetch('https://stock-tracker-nox1.onrender.com/api/stock'),
        fetch('https://stock-tracker-nox1.onrender.com/api/orders')
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized calculations
  const topOrderedProducts = useMemo(() => {
    const productMap = {};
    orders.forEach(order => {
      const name = order.productSnapshot?.name || 'Unnamed';
      if (!productMap[name]) {
        productMap[name] = { name, count: 0, totalRevenue: 0 };
      }
      productMap[name].count += order.quantityOrdered;
      productMap[name].totalRevenue += order.orderTotal;
    });
    return Object.values(productMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  const categoryDistribution = useMemo(() => {
    const categoryMap = {};
    const validCategories = [
      "Engine", "Brakes", "Transmission", "Suspension",
      "Electrical", "Body", "Interior", "Other"
    ];
    orders.forEach(order => {
      let cat = order.productSnapshot?.category;
      if (!validCategories.includes(cat)) cat = "Other";
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat] += 1;
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const availabilityData = useMemo(() => {
    const orderCounts = {};
    orders.forEach(order => {
      const name = order.productSnapshot?.name || 'Unnamed';
      if (!orderCounts[name]) orderCounts[name] = 0;
      orderCounts[name] += order.quantityOrdered;
    });
    return stockEntries
      .map(stock => ({
        name: stock.companyName || 'Unnamed',
        stock: stock.spares || 0,
        ordered: orderCounts[stock.companyName || 'Unnamed'] || 0
      }))
      .filter(item => item.stock > 0 || item.ordered > 0);
  }, [orders, stockEntries]);

  const orderTrendData = useMemo(() => {
    const trendMap = {};
    orders.forEach(order => {
      const date = new Date(order.orderDate || order.createdAt).toLocaleDateString();
      if (!trendMap[date]) trendMap[date] = 0;
      trendMap[date] += 1;
    });
    return Object.entries(trendMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [orders]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><h2>Loading analytics...</h2></div>;
  if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}><h2>Error</h2><p>{error}</p></div>;
  if (orders.length === 0 && stockEntries.length === 0) return <div style={{ textAlign: 'center', padding: '50px' }}><h2>No Data Found</h2></div>;

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ textAlign: 'center', margin: '20px 0', fontStyle: 'italic', fontSize: '16px' }}>
        "{currentQuote}"
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {/* Chart 1: Top Ordered Products */}
        <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '10px' }}>
          <h3>Top Ordered Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topOrderedProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRevenue" name="Total Ordered Cost (₹)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Orders by Category */}
        <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '10px' }}>
          <h3>Orders by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
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
            <BarChart data={availabilityData}>
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

        {/* Chart 4: Order Trend Over Time */}
        <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '10px' }}>
          <h3>Demand Acceleration</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={orderTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Orders" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default React.memo(Analytics);
