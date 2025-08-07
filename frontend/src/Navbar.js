// Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './navbar.css'; // You can have separate styles for the navbar

function Navbar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <h1>Sri Madhura Engineering</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/user">User Page</Link>

        {role === 'admin' ? (
          <>
            <button onClick={() => navigate('/admin')} style={{ marginLeft: '20px' }}>
              Admin Dashboard
            </button>
            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">
            
            <p>Admin Login</p>
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
