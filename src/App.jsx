import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FileManager from './components/FileManager';
import NotesManager from './components/NotesManager';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('auth_pin');
    if (auth === '0000') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (pin) => {
    if (pin === '0000') {
      localStorage.setItem('auth_pin', '0000');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_pin');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
        >
          <Route index element={<FileManager />} />
          <Route path="notes" element={<NotesManager />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
