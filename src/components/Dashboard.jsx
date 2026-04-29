import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Dashboard = ({ onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="overlay" 
          style={{ zIndex: 40, backdropFilter: 'none', background: 'rgba(0,0,0,0.5)' }}
          onClick={closeMobileMenu}
        />
      )}
      
      <Sidebar isOpen={mobileMenuOpen} onClose={closeMobileMenu} />
      
      <div className="content-area animate-fade-in">
        <Header onLogout={onLogout} onMenuClick={toggleMobileMenu} onSearch={setSearchQuery} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet context={{ searchQuery }} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
