import React, { useState, useEffect } from 'react';
import { Cloud } from 'lucide-react';
import { supabase } from '../supabase';

const StorageIndicator = () => {
  const [usedBytes, setUsedBytes] = useState(0);
  const totalGB = 5;

  useEffect(() => {
    const fetchStorageSize = async () => {
      try {
        const { data, error } = await supabase.storage.from('personal-cloud').list();
        if (data && !error) {
          const totalSize = data.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
          setUsedBytes(totalSize);
        }
      } catch (err) {
        console.error('Error fetching storage size', err);
      }
    };
    
    fetchStorageSize();
  }, []);

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const usedFormatted = formatBytes(usedBytes);
  const limitString = '5 TB';
  
  const percentage = Math.max(1, (usedBytes / (5 * 1024 * 1024 * 1024 * 1024)) * 100);

  return (
    <div className="storage-widget">
      <div className="storage-title">
        <Cloud size={18} />
        <span>Penyimpanan</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="storage-text">
        {usedFormatted} dari {limitString} digunakan
      </div>
    </div>
  );
};

export default StorageIndicator;
