import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { documentService } from '../services/documentService';
import { Upload as UploadIcon, X, FileText, FileImage, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Certificates', 'Grade Reports / Mark Sheets', 'ID Cards',
  'Transcripts', 'Achievements', 'Internship Documents', 'Other Academic Records',
];

export default function Upload() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', institutionName: '', remarks: '' });
  const [errors, setErrors] = useState({});

  const acceptedFile = (f) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(f.type)) { toast.error('Only PDF, PNG, JPG allowed'); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error('File must be under 10 MB'); return; }
    setFile(f);
    if (!form.title) setForm(p => ({ ...p, title: f.name.replace(/\.[^/.]+$/, '').slice(0, 100) }));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptedFile(f);
  }, [form.title]);

  const validate = () => {
    const e = {};
    if (!file) e.file = 'Please select a file';
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length > 100) e.title = 'Max 100 characters';
    if (!form.category) e.category = 'Please select a category';
    if (form.institutionName.length > 150) e.institutionName = 'Max 150 characters';
    if (form.remarks.length > 500) e.remarks = 'Max 500 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setUploading(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      await documentService.upload(fd, setProgress);
      toast.success('Document uploaded successfully!');
      navigate('/documents');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Upload Document</h1>
          <p className="text-gray-500 text-sm mt-1">Add a new credential to your secure vault</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-in">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !file && fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer
              ${dragging ? 'border-primary-500 bg-primary-500/10' : 'border-surface-border hover:border-primary-500/40 hover:bg-dark-800'}
              ${file ? 'cursor-default' : ''}`}
          >
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg"
              onChange={e => e.target.files[0] && acceptedFile(e.target.files[0])} />

            {file ? (
              <div className="flex items-center justify-between bg-dark-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {file.type === 'application/pdf'
                    ? <FileText size={24} className="text-red-400" />
                    : <FileImage size={24} className="text-blue-400" />}
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button type="button" onClick={e => { e.stopPropagation(); setFile(null); setProgress(0); }}
                  className="w-7 h-7 rounded-full bg-dark-600 hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UploadIcon size={24} className="text-gray-500" />
                </div>
                <p className="text-white font-medium">Drag & drop your file here</p>
                <p className="text-gray-500 text-sm mt-1">or <span className="text-primary-400">browse files</span></p>
                <p className="text-gray-600 text-xs mt-3">PDF, PNG, JPG · Max 10 MB</p>
              </>
            )}
          </div>
          {errors.file && <p className="error-msg -mt-4"><AlertCircle size={12} className="inline mr-1" />{errors.file}</p>}

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading...</span><span>{progress}%</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="label" title="Give your document a descriptive name">
              Document Title <span className="text-red-400">*</span>
            </label>
            <input id="title" type="text" maxLength={100} className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. B.Tech Final Year Certificate"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <div className="flex justify-between mt-1">
              {errors.title ? <p className="error-msg">{errors.title}</p> : <span />}
              <span className="text-xs text-gray-600">{form.title.length}/100</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label">Category <span className="text-red-400">*</span></label>
            <div className="flex flex-wrap gap-2 mb-3">
              {CATEGORIES.slice(0, 5).map(cat => (
                <button key={cat} type="button"
                  onClick={() => setForm(p => ({ ...p, category: cat }))}
                  className={`chip ${form.category === cat ? 'active' : ''}`}>
                  {cat}
                </button>
              ))}
            </div>
            <select className={`input ${errors.category ? 'input-error' : ''} bg-dark-700`}
              value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <option value="">Select a category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="error-msg mt-1">{errors.category}</p>}
          </div>

          {/* Institution */}
          <div>
            <label htmlFor="institutionName" className="label" title="The university or organization that issued this document">
              Institution Name <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <input id="institutionName" type="text" maxLength={150} className="input"
              placeholder="e.g. Gauhati University"
              value={form.institutionName} onChange={e => setForm(p => ({ ...p, institutionName: e.target.value }))} />
          </div>

          {/* Remarks */}
          <div>
            <label htmlFor="remarks" className="label" title="Any additional notes about this document">
              Remarks <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea id="remarks" rows={3} maxLength={500} className="input resize-none"
              placeholder="Any notes about this document…"
              value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
            <p className="text-xs text-gray-600 text-right mt-1">{form.remarks.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={uploading} className="btn-primary px-8 py-3">
              {uploading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
                : <><UploadIcon size={16} /> Upload Document</>}
            </button>
            <button type="button" onClick={() => navigate('/documents')} className="btn-secondary px-8 py-3">
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
