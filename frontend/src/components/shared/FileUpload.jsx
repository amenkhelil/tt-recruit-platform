import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { formatFileSize } from '../../utils/formatters';

export const FileUpload = ({
  onFileSelect,
  accept = '.pdf,application/pdf',
  maxSizeMb = 5,
  label = 'Téléverser votre CV',
  helper = 'Format PDF uniquement (Max. 5 Mo)',
  isLoading = false,
  className = '',
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = (file) => {
    setError('');
    if (!file) return false;

    // Check size
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Le fichier dépasse la taille maximale autorisée (${maxSizeMb} Mo).`);
      return false;
    }

    // Check type if PDF
    if (accept.includes('pdf') && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Veuillez sélectionner un document au format PDF valide.');
      return false;
    }

    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        if (onFileSelect) onFileSelect(file);
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        if (onFileSelect) onFileSelect(file);
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          dragOver
            ? 'border-tt-blue bg-blue-50/50 scale-[0.99]'
            : selectedFile
            ? 'border-emerald-300 bg-emerald-50/20'
            : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/60 hover:border-tt-blue/50'
        } ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center space-x-3 w-full max-w-md p-3.5 rounded-xl bg-white border border-emerald-200 shadow-soft">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3.5 rounded-2xl bg-white shadow-soft text-tt-blue mb-1">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <span className="text-sm font-bold text-tt-blue hover:underline">
                Cliquez pour choisir un fichier
              </span>
              <span className="text-sm text-slate-600"> ou glissez-déposez ici</span>
            </div>
            <p className="text-xs text-slate-400">{helper}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
