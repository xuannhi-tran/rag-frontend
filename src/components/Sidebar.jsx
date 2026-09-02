import React, { useRef, useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Database, 
  Sparkles, 
  Trash2, 
  Loader2,
  FileCheck,
  ChevronLeft
} from 'lucide-react';

export default function Sidebar({
  documents,
  onUpload,
  uploading,
  isOpen,
  onToggle,
  onRemoveDoc
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.pdf')) {
        onUpload(file);
      } else {
        alert('Please upload a PDF document.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-80 bg-slate-900/95 lg:bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* App Branding */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                RAG Assistant
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs text-slate-400 font-medium">Knowledge Base Active</span>
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Document Ingestion / Upload Section */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Upload Knowledge Source
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 font-medium">
              PDF Only
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
              dragActive 
                ? 'border-sky-400 bg-sky-500/10 scale-[0.99]' 
                : 'border-slate-700/80 hover:border-sky-500/60 bg-slate-950/40 hover:bg-slate-800/40'
            } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center py-2">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-2" />
                <p className="text-xs font-semibold text-slate-200">Vectorizing Document...</p>
                <p className="text-[11px] text-slate-400 mt-1">Chunking & embedding into DB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-1">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-2 group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-colors text-slate-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-200">
                  <span className="text-sky-400 font-semibold underline decoration-sky-400/50 underline-offset-2">Click to upload</span> or drag PDF
                </p>
                <p className="text-[11px] text-slate-500 mt-1">PDFs up to 25MB supported</p>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Indexed Documents ({documents.length})
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-8 px-3 border border-slate-800/60 rounded-xl bg-slate-950/20">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-400 font-medium">No documents uploaded yet</p>
              <p className="text-[11px] text-slate-500 mt-1">Upload a PDF above to ask context-aware questions.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="group flex items-start justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">
                          {doc.size || 'PDF'}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Indexed
                        </span>
                      </div>
                    </div>
                  </div>

                  {onRemoveDoc && (
                    <button
                      onClick={() => onRemoveDoc(doc.name)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-all"
                      title="Remove from session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer / System Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Endpoint</span>
            <span className="text-slate-200 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              rag-assistant-nhi
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

