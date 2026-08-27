import React, { useState, useRef } from 'react';
import { uploadPdf, resetStorage } from '../services/api';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  PlusCircle,
  Layers,
} from 'lucide-react';

export default function UploadPDF({
  documents = [],
  onUploadSuccess,
  onResetSuccess,
  isUploading,
  setIsUploading,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFileUpload(file);
    }
  };

  const processFileUpload = async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showNotification('error', 'Por favor selecciona un archivo en formato .pdf');
      return;
    }

    try {
      setIsUploading(true);
      setNotification(null);
      const data = await uploadPdf(file);
      const chunksMessage = data.chunks_created
        ? ` (${data.chunks_created} fragmentos generados)`
        : '';
      showNotification(
        'success',
        `¡Documento "${data.filename || file.name}" procesado con éxito!${chunksMessage}`
      );
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errDetail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Error al subir el archivo. Intenta nuevamente.';
      showNotification('error', errDetail);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleReset = async () => {
    if (
      documents.length > 0 &&
      !window.confirm(
        '¿Estás seguro de resetear la base de conocimientos? Se eliminarán todos los documentos procesados.'
      )
    ) {
      return;
    }

    try {
      setIsResetting(true);
      const data = await resetStorage();
      showNotification(
        'success',
        data.message || 'Base de datos y documentos limpiados correctamente.'
      );
      if (onResetSuccess) {
        onResetSuccess();
      }
    } catch (error) {
      console.error('Reset error:', error);
      showNotification('error', 'Error al reiniciar la base de conocimientos.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
            <UploadCloud className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
            Cargar Documento PDF
          </h2>
        </div>
        {documents.length > 0 && (
          <button
            onClick={handleReset}
            disabled={isResetting || isUploading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/60 transition-colors disabled:opacity-50 cursor-pointer"
            title="Limpiar vectorstore y documentos subidos"
          >
            {isResetting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Limpiar Todo</span>
          </button>
        )}
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
            : 'border-indigo-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30'
        } ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="p-3 bg-indigo-50 rounded-full text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-700">
              {isUploading
                ? 'Procesando y creando fragmentos...'
                : 'Haz clic o arrastra tu PDF aquí'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Solo archivos PDF (máx. 10MB sugerido)
            </p>
          </div>

          {!isUploading && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              <PlusCircle className="w-3 h-3" /> Seleccionar PDF
            </span>
          )}
        </div>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 animate-fadeIn border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="flex-1 leading-relaxed">{notification.message}</span>
        </div>
      )}

      {/* Loaded Documents List */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Documentos Cargados ({documents.length})
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Aún no hay documentos indexados. Sube un PDF para comenzar.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs font-medium max-w-full"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate max-w-[180px]">{doc}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
