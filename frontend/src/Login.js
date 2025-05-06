import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

function Login({ setLoggedInRole }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminFields, setShowAdminFields] = useState(false);
  const navigate = useNavigate();

  const handleUserLogin = () => {
    setLoggedInRole('user');
    navigate('/user');
  };

  const handleAdminClick = () => {
    setShowAdminFields(true);
    setError('');
  };

  const handleAdminLogin = () => {
    if (username === 'admin' && password === '123') {
      setLoggedInRole('admin');
      navigate('/admin');
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="extra-info">
          <h1>Sri Madhura Engineering</h1>
          <p>Your trusted partner for car spare parts production.</p>
          <ul>
            <li><strong>User:</strong> Place orders for spare parts and track them.</li>
            <li><strong>Admin:</strong> Manage inventory, orders, and users.</li>
          </ul>
        </div>

        <div className="login-container">
          <div className="login-box">
            <h2>Login</h2>
            <div className="button-group">
              <button onClick={handleUserLogin}>Login as User</button>
              <button onClick={handleAdminClick}>Login as Admin</button>
            </div>

            {/* Conditionally show admin input fields */}
            {showAdminFields && (
              <div className="admin-login-fields">
                <input
                  type="text"
                  placeholder="Admin Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleAdminLogin}>Submit Admin Login</button>
                {error && <p className="error-message">{error}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
