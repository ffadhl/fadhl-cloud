import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { supabase } from '../supabase';

const FileUploadModal = ({ onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('personal-cloud').upload(fileName, file);
      
      if (error) throw error;
      
      window.location.reload();
    } catch (err) {
      console.error('Upload error', err);
      alert('Gagal mengunggah file.');
      setUploading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="modal animate-fade-in">
        <div className="modal-header">
          <h3 style={{ fontSize: '18px', fontWeight: 500 }}>Upload File</h3>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}><X size={24} /></button>
        </div>

        <div 
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <input 
            type="file" 
            ref={inputRef} 
            style={{ display: 'none' }} 
            onChange={handleChange}
          />
          <UploadCloud size={48} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
          {file ? (
            <p style={{ fontWeight: 500 }}>{file.name}</p>
          ) : (
            <div>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>Tarik dan lepas file ke sini</p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>atau klik untuk memilih file</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-text" onClick={onClose} disabled={uploading}>Batal</button>
          <button 
            className="btn-filled" 
            onClick={handleUpload} 
            disabled={!file || uploading}
          >
            {uploading ? 'Mengunggah...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
