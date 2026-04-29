import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const LiveNoteEditor = ({ noteId, onBack }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const navigate = useNavigate();

  // Load initial note data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', noteId)
          .single();

        if (error) throw error;
        
        setTitle(data.title || '');
        setContent(data.content || '');
      } catch (err) {
        console.error('Error fetching note:', err);
        alert('Gagal memuat catatan.');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  // Setup Realtime subscription
  useEffect(() => {
    const channel = supabase.channel(`note_${noteId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'notes',
        filter: `id=eq.${noteId}` 
      }, (payload) => {
        // Only update if changes came from elsewhere to avoid cursor jumping
        // A simple way is to check if it's the exact same content, but a real collaborative editor uses CRDTs.
        // For MVP, if it's changed by another client, we update it.
        const newTitle = payload.new.title || '';
        const newContent = payload.new.content || '';
        setTitle((prev) => prev !== newTitle ? newTitle : prev);
        setContent((prev) => prev !== newContent ? newContent : prev);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [noteId]);

  // Auto-save logic with debounce
  useEffect(() => {
    if (loading) return; // Don't save while initial load

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const { error } = await supabase
          .from('notes')
          .update({ 
            title: title || 'Tanpa Judul', 
            content: content,
            updated_at: new Date().toISOString()
          })
          .eq('id', noteId);

        if (error) throw error;
        setSaveStatus('saved');
      } catch (err) {
        console.error('Error saving note:', err);
        setSaveStatus('error');
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [title, content, noteId, loading]);

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'Catatan'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="content-padding">Memuat Editor...</div>;
  }

  return (
    <div className="content-padding animate-fade-in live-note-editor">
      <div className="live-note-header">
        <button 
          onClick={onBack} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="save-status">
            {saveStatus === 'saving' && <><Loader size={14} className="spin" /> Menyimpan...</>}
            {saveStatus === 'saved' && <><Save size={14} /> Tersimpan ke Cloud</>}
            {saveStatus === 'error' && <span style={{ color: 'red' }}>Gagal menyimpan</span>}
          </div>
          <button 
            onClick={handleDownloadTxt}
            className="btn-text"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', padding: '6px 12px' }}
          >
            <Download size={16} /> Save as .txt
          </button>
        </div>
      </div>

      <input
        type="text"
        className="live-note-title-input"
        placeholder="Judul Catatan"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <textarea
        className="live-note-textarea"
        placeholder="Mulai mengetik catatan Anda di sini..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
};

export default LiveNoteEditor;
