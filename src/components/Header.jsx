import React from 'react';
import { Search, LogOut, Settings, Menu } from 'lucide-react';

const Header = ({ onLogout, onMenuClick, onSearch }) => {
  return (
    <div className="top-header">
      <button className="mobile-menu-btn" onClick={onMenuClick}>
        <Menu size={24} />
      </button>
      
      <div className="search-bar">
        <Search size={20} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Telusuri di Drive" 
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: 'auto' }}>
        <button style={{ color: 'var(--text-secondary)' }} title="Pengaturan">
          <Settings size={24} />
        </button>
        <button 
          onClick={onLogout} 
          style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
          title="Keluar"
        >
          <LogOut size={20} />
          <span style={{ fontSize: '14px', fontWeight: 500 }} className="desktop-only">Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
