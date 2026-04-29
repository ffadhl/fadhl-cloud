import React, { useEffect, useState, useRef } from 'react';
import { File, Image as ImageIcon, FileText, Music, Video, Archive, Trash, Grid, List as ListIcon, Download, UploadCloud, X, MoreVertical } from 'lucide-react';
import { supabase } from '../supabase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useOutletContext } from 'react-router-dom';

const FileManager = () => {
  const { searchQuery } = useOutletContext();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from('personal-cloud').list();
      if (error) throw error;
      
      const validFiles = data.filter(f => f.name !== '.emptyFolderPlaceholder');
      setFiles(validFiles || []);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileName, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Hapus file ${fileName}?`)) return;
    
    try {
      const { error } = await supabase.storage.from('personal-cloud').remove([fileName]);
      if (error) throw error;
      setFiles(files.filter(f => f.name !== fileName));
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Gagal menghapus file.');
    }
  };

  const handleDownload = async (fileName, e) => {
    if (e) e.stopPropagation();
    try {
      const { data, error } = await supabase.storage.from('personal-cloud').download(fileName);
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Gagal mengunduh file.');
    }
  };

  const handleDownloadAll = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const zip = new JSZip();
      
      const downloadPromises = files.map(async (file) => {
        const { data, error } = await supabase.storage.from('personal-cloud').download(file.name);
        if (!error && data) {
          zip.file(file.name, data);
        }
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'Fadhl_Cloud_Backup.zip');
    } catch (err) {
      console.error('Error downloading all:', err);
      alert('Gagal mengunduh semua file.');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType, size = 24) => {
    if (!mimeType) return <File size={size} />;
    if (mimeType.startsWith('image/')) return <ImageIcon size={size} />;
    if (mimeType.startsWith('video/')) return <Video size={size} />;
    if (mimeType.startsWith('audio/')) return <Music size={size} />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText size={size} />;
    if (mimeType.includes('zip') || mimeType.includes('tar')) return <Archive size={size} />;
    return <File size={size} />;
  };

  const formatBytes = (bytes) => {
    if (!+bytes) return '0.00 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Drag and Drop Logic
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (fileList) => {
    setUploading(true);
    try {
      const uploadPromises = fileList.map(async (file) => {
        const fileName = `${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('personal-cloud').upload(fileName, file);
        if (error) throw error;
      });
      await Promise.all(uploadPromises);
      fetchFiles();
    } catch (err) {
      console.error('Upload error', err);
      alert('Gagal mengunggah satu atau lebih file.');
    } finally {
      setUploading(false);
    }
  };

  const openPreview = (file) => {
    const url = supabase.storage.from('personal-cloud').getPublicUrl(file.name).data.publicUrl;
    setPreviewFile({ ...file, url });
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes((searchQuery || '').toLowerCase()));

  return (
    <div 
      className="content-padding animate-fade-in"
      style={{ position: 'relative', height: '100%' }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {dragActive && (
        <div className="fullscreen-drag-overlay">
          <div className="fullscreen-drag-overlay-content">
            <UploadCloud size={24} />
            Lepaskan file untuk mengunggah ke Cloud
          </div>
        </div>
      )}

      {/* Hidden file input for programatic uploads if needed later */}
      <input 
        type="file" 
        multiple
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileInput}
      />

      <div className="section-header">
        <h2 className="section-title">File Saya</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-text" 
            onClick={handleDownloadAll}
            disabled={files.length === 0 || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)' }}
          >
            <Download size={16} /> Download All
          </button>

          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Tampilan Daftar"
            >
              <ListIcon size={18} />
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Tampilan Grid"
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Memuat file...</p>
      ) : files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-secondary)' }}>
          <File size={64} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
          <p>Belum ada file. Tarik file ke atas untuk mengunggah.</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-secondary)' }}>
          <p>Pencarian tidak menemukan file.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid-layout">
          {filteredFiles.map((file) => {
            const isImage = file.metadata?.mimetype?.startsWith('image/');
            const publicUrl = supabase.storage.from('personal-cloud').getPublicUrl(file.name).data.publicUrl;
            return (
              <div key={file.id} className="file-preview-card" onClick={() => openPreview(file)}>
                <div className="file-preview-header">
                  <div style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}>
                    {getFileIcon(file.metadata?.mimetype, 20)}
                  </div>
                  <div className="file-preview-name" title={file.name}>
                    {file.name}
                  </div>
                  <div className="file-preview-actions">
                    <button className="file-preview-btn">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
                <div className="file-preview-body">
                  {isImage ? (
                    <img src={publicUrl} alt={file.name} loading="lazy" />
                  ) : (
                    <div className="file-preview-body-document">
                      {getFileIcon(file.metadata?.mimetype, 48)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="list-layout-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Terakhir Diubah</th>
                <th>Ukuran</th>
                <th style={{ width: '80px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} onClick={() => openPreview(file)}>
                  <td>
                    <div className="list-file-name-cell">
                      <div style={{ color: 'var(--primary-color)' }}>
                        {getFileIcon(file.metadata?.mimetype, 18)}
                      </div>
                      <span style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td>{formatDate(file.created_at)}</td>
                  <td>{formatBytes(file.metadata?.size)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={(e) => handleDownload(file.name, e)}
                        style={{ color: 'var(--text-secondary)', padding: '4px' }}
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(file.name, e)}
                        style={{ color: 'var(--text-disabled)', padding: '4px' }}
                        title="Hapus"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="overlay" onClick={() => setPreviewFile(null)}>
          <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <span style={{ fontWeight: 500, fontSize: '16px' }}>{previewFile.name}</span>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  onClick={() => handleDownload(previewFile.name)}
                  style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={20} />
                </button>
                <button onClick={() => setPreviewFile(null)} style={{ color: 'white' }}>
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="preview-modal-content">
              {previewFile.metadata?.mimetype?.startsWith('image/') ? (
                <img src={previewFile.url} alt={previewFile.name} />
              ) : previewFile.metadata?.mimetype?.startsWith('video/') ? (
                <video src={previewFile.url} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  {getFileIcon(previewFile.metadata?.mimetype, 96)}
                  <p style={{ marginTop: '24px', fontSize: '18px' }}>Pratinjau tidak tersedia untuk file ini.</p>
                  <button 
                    className="btn-filled" 
                    onClick={() => handleDownload(previewFile.name)}
                    style={{ marginTop: '24px' }}
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
