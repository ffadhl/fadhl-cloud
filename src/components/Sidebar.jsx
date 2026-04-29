import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Cloud, Folder, FileText, Plus, X } from 'lucide-react';
import StorageIndicator from './StorageIndicator';
import FileUploadModal from './FileUploadModal';
import { supabase } from '../supabase';

const Sidebar = ({ isOpen, onClose }) => {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowNewMenu(false);
      }
    };

    if (showNewMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNewMenu]);

  const handleCreateNote = async () => {
    setShowNewMenu(false);
    if (onClose) onClose();
    
    // Create an empty note and navigate to it
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ title: 'Catatan Tanpa Judul', content: '' }])
        .select()
        .single();
        
      if (error) throw error;
      if (data) {
        navigate(`/notes?id=${data.id}`);
      }
    } catch (err) {
      console.error('Error creating note:', err);
      alert('Gagal membuat catatan. Pastikan tabel "notes" sudah ada di Supabase.');
    }
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="logo-area" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Cloud size={28} color="var(--primary-color)" />
          <span style={{ fontFamily: 'var(--font-family-brand)', fontWeight: 500 }}>Fadhl Cloud</span>
        </div>
        {/* Mobile close button */}
        {isOpen && (
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        )}
      </div>

      <div style={{ position: 'relative' }} ref={menuRef}>
        <button className="new-btn" onClick={() => setShowNewMenu(!showNewMenu)}>
          <Plus size={20} />
          Baru
        </button>

        {showNewMenu && (
          <div style={{
            position: 'absolute',
            top: '60px',
            left: 0,
            background: 'var(--surface-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '8px 0',
            width: '200px',
            zIndex: 10
          }}>
            <button 
              className="menu-item" 
              onClick={() => { setShowUploadModal(true); setShowNewMenu(false); if(onClose) onClose(); }}
            >
              <Folder size={18} style={{ color: 'var(--text-secondary)' }} />
              <span>Upload File</span>
            </button>
            <button 
              className="menu-item" 
              onClick={handleCreateNote}
            >
              <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
              <span>Buat Catatan</span>
            </button>
          </div>
        )}
      </div>

      <nav>
        <NavLink to="/" onClick={handleLinkClick} className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Folder size={20} />
          <span>My Drive</span>
        </NavLink>
        <NavLink to="/notes" onClick={handleLinkClick} className={`nav-item ${location.pathname === '/notes' ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Catatan</span>
        </NavLink>
      </nav>

      <StorageIndicator />

      {showUploadModal && <FileUploadModal onClose={() => setShowUploadModal(false)} />}
    </div>
  );
};

export default Sidebar;
