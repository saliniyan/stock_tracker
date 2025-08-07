import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { InventoryProvider } from './admin/InventoryContext';
import Dashboard from './admin/Dashboard';
import Orders from './admin/Orders';
import Inventory from './admin/Inventory';
import SpareParts from './admin/SpareParts';
import SparePartDetail from './admin/SparePartDetail';
import Reports from './admin/Reports';

// Main App Component
function Admin() {
  return (
    <InventoryProvider>
      <div>
        <Navbar />
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
      </div>
    </InventoryProvider>
  );
}

export default Admin;