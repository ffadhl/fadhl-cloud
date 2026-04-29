import React, { useEffect, useState } from 'react';
import { FileText, Trash, Plus } from 'lucide-react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../supabase';
import LiveNoteEditor from './LiveNoteEditor';

const NotesManager = () => {
  const { searchQuery } = useOutletContext();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeNoteId = searchParams.get('id');

  useEffect(() => {
    if (!activeNoteId) {
      fetchNotes();
    }
  }, [activeNoteId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, updated_at')
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, noteId) => {
    e.stopPropagation();
    if (!window.confirm('Hapus catatan ini?')) return;
    
    try {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);
      if (error) throw error;
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Gagal menghapus catatan.');
    }
  };

  const handleCreate = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ title: 'Catatan Baru', content: '' }])
        .select()
        .single();
        
      if (error) throw error;
      if (data) {
        navigate(`/notes?id=${data.id}`);
      }
    } catch (err) {
      console.error('Error creating note:', err);
      alert('Gagal membuat catatan. Pastikan tabel notes sudah ada.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (activeNoteId) {
    return <LiveNoteEditor noteId={activeNoteId} onBack={() => navigate('/notes')} />;
  }

  const filteredNotes = notes.filter(n => 
    (n.title && n.title.toLowerCase().includes((searchQuery || '').toLowerCase())) ||
    (n.content && n.content.toLowerCase().includes((searchQuery || '').toLowerCase()))
  );

  return (
    <div className="content-padding animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">Catatan Saya</h2>
        <button className="btn-filled" onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Buat
        </button>
      </div>
      
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Memuat catatan...</p>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-secondary)' }}>
          <FileText size={64} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
          <p>Belum ada catatan. Klik "Buat" untuk memulai menulis.</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-secondary)' }}>
          <p>Pencarian tidak menemukan catatan.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <div key={note.id} className="note-card" onClick={() => navigate(`/notes?id=${note.id}`)}>
              <div className="note-card-header">
                <div>
                  <div className="note-card-title">{note.title || 'Tanpa Judul'}</div>
                  <div className="note-card-date">{formatDate(note.updated_at)}</div>
                </div>
                <button 
                  onClick={(e) => handleDelete(e, note.id)}
                  style={{ color: 'var(--text-disabled)', padding: '4px' }}
                  title="Hapus"
                >
                  <Trash size={16} />
                </button>
              </div>
              <div className="note-card-preview">
                {note.content ? note.content.substring(0, 100) : 'Tidak ada konten...'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesManager;
