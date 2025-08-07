import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useInventory } from './InventoryContext';

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

export default Reports;