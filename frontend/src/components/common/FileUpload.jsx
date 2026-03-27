import { useState } from 'react';

export default function FileUpload({ 
  onUpload, 
  accept = 'image/*',
  maxSize = 5, // MB
  label = 'Upload File',
  preview = true,
  currentFile = null
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentFile);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;

    setError('');

    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    const fileType = file.type;
    const acceptTypes = accept.split(',').map(t => t.trim());
    
    const isValidType = acceptTypes.some(type => {
      if (type === 'image/*') return fileType.startsWith('image/');
      if (type === 'application/*') return fileType.startsWith('application/');
      return fileType === type;
    });

    if (!isValidType) {
      setError('Invalid file type');
      return;
    }

    setSelectedFile(file);

    if (preview && fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant px-1 italic">
        {label}
      </label>

      {/* Drag & Drop Area */}
      <div
        className={`relative group h-48 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden gap-4 ${
          dragActive 
          ? 'bg-primary/10 border-primary' 
          : 'bg-white/[0.02] border-white/10 hover:border-primary/40 hover:bg-white/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {previewUrl && preview ? (
          <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-3xl">edit</span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3 pointer-events-none">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto transition-all ${dragActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-white/5 text-on-surface-variant group-hover:text-primary'}`}>
                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
            </div>
            <div>
                <p className="text-xs font-black uppercase tracking-widest text-white">Transmit Data</p>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant/40 mt-1">Max {maxSize}MB // {accept.replace('/*', '')} </p>
            </div>
          </div>
        )}

        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-black text-white uppercase truncate tracking-tighter">{selectedFile.name}</h4>
            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-30 text-on-primary rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            {uploading ? 'Processing...' : 'Sync Now'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in fade-in shake duration-500">
            <span className="material-symbols-outlined text-sm">emergency</span>
            {error}
        </div>
      )}
    </div>
  );
}