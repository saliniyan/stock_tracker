import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Admin from './Admin';
import User from './User';
import Login from './Login';

function App() {
  const [loggedInRole, setLoggedInRole] = useState(null);

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Default route redirects to /login */}
          <Route path="/" element={<Navigate to="/login" />} />

          <Route
            path="/login"
            element={<Login setLoggedInRole={setLoggedInRole} />}
          />

          <Route
            path="/user"
            element={
              loggedInRole === 'user' ? (
                <User />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/admin/*"
            element={
              loggedInRole === 'admin' ? (
                <Admin />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
