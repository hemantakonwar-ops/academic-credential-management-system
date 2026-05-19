import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { documentService } from '../services/documentService';
import {
  FileText, FileImage, Download, Trash2, Edit2, ArrowLeft,
  Calendar, Clock, Building, Tag, HardDrive, Save, X, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Certificates', 'Grade Reports / Mark Sheets', 'ID Cards',
  'Transcripts', 'Achievements', 'Internship Documents', 'Other Academic Records',
];
const CATEGORY_COLORS = {
  'Certificates': 'badge-green', 'Grade Reports / Mark Sheets': 'badge-yellow',
  'ID Cards': 'badge-blue', 'Transcripts': 'badge-blue',
  'Achievements': 'badge-green', 'Internship Documents': 'badge-yellow', 'Other Academic Records': 'badge-gray',
};
function formatBytes(b) { if (!b) return '0 B'; const k = 1024, s = ['B', 'KB', 'MB']; const i = Math.floor(Math.log(b) / Math.log(k)); return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`; }
function fmt(d) { return d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    documentService.getOne(id)
      .then(({ data }) => { setDoc(data.data); setForm({ title: data.data.title, category: data.data.category, institutionName: data.data.institutionName || '', remarks: data.data.remarks || '' }); })
      .catch(err => { toast.error(err.message); navigate('/documents'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await documentService.update(id, form);
      setDoc(prev => ({ ...prev, ...data.data }));
      setEditing(false);
      toast.success('Document updated!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await documentService.delete(id);
      toast.success('Document permanently deleted.');
      navigate('/documents');
    } catch (err) { toast.error(err.message); setDeleting(false); }
  };

  const handleDownload = () => {
    if (doc?.signedUrl) {
      const a = document.createElement('a');
      a.href = doc.signedUrl;
      a.download = doc.title;
      a.target = '_blank';
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-dark-900">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!doc) return null;
  const isPdf = doc.fileType === 'application/pdf';

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Back */}
        <Link to="/documents" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Documents
        </Link>

        <div className="grid lg:grid-cols-5 gap-6 animate-in">
          {/* Preview panel */}
          <div className="lg:col-span-3 card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Preview</h2>
              <div className="flex gap-2">
                <button onClick={handleDownload} className="btn-secondary text-sm py-1.5 px-3">
                  <Download size={14} /> Download
                </button>
              </div>
            </div>

            <div className="bg-dark-700 rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]">
              {doc.signedUrl ? (
                isPdf ? (
                  <iframe src={doc.signedUrl} title={doc.title} className="w-full h-[500px] rounded-xl border-0" />
                ) : (
                  <img src={doc.signedUrl} alt={doc.title} className="max-w-full max-h-[500px] object-contain rounded-xl" />
                )
              ) : (
                <div className="text-center py-12">
                  {isPdf ? <FileText size={48} className="text-red-400 mx-auto mb-3" /> : <FileImage size={48} className="text-blue-400 mx-auto mb-3" />}
                  <p className="text-gray-500">Preview not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">Document Info</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-1.5 px-3">
                    <Edit2 size={14} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-1.5 px-3">
                      {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                      Save
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-1.5 px-3"><X size={14} /></button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="label text-xs flex items-center gap-1.5"><FileText size={12} />Title</label>
                  {editing ? (
                    <input className="input text-sm" maxLength={100} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                  ) : (
                    <p className="text-white text-sm font-medium">{doc.title}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="label text-xs flex items-center gap-1.5"><Tag size={12} />Category</label>
                  {editing ? (
                    <select className="input text-sm bg-dark-700" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <span className={`badge ${CATEGORY_COLORS[doc.category] || 'badge-gray'}`}>{doc.category}</span>
                  )}
                </div>

                {/* Institution */}
                <div>
                  <label className="label text-xs flex items-center gap-1.5"><Building size={12} />Institution</label>
                  {editing ? (
                    <input className="input text-sm" maxLength={150} value={form.institutionName} onChange={e => setForm(p => ({ ...p, institutionName: e.target.value }))} />
                  ) : (
                    <p className="text-gray-300 text-sm">{doc.institutionName || '—'}</p>
                  )}
                </div>

                {/* Remarks */}
                <div>
                  <label className="label text-xs">Remarks</label>
                  {editing ? (
                    <textarea className="input text-sm resize-none" rows={3} maxLength={500} value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
                  ) : (
                    <p className="text-gray-300 text-sm">{doc.remarks || '—'}</p>
                  )}
                </div>

                {/* Meta */}
                <div className="border-t border-surface-border pt-4 space-y-2.5 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><Calendar size={12} /> Uploaded: <span className="text-gray-400">{fmt(doc.uploadDate)}</span></div>
                  <div className="flex items-center gap-2"><Clock size={12} /> Modified: <span className="text-gray-400">{fmt(doc.lastModified)}</span></div>
                  <div className="flex items-center gap-2"><HardDrive size={12} /> Size: <span className="text-gray-400">{formatBytes(doc.fileSizeBytes)}</span></div>
                  <div className="flex items-center gap-2"><FileText size={12} /> Type: <span className="text-gray-400">{doc.fileType}</span></div>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="card border border-red-500/20 bg-red-500/5">
              <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} /> Danger Zone
              </h3>
              <p className="text-xs text-gray-500 mb-3">Permanently deletes this document and removes the file from cloud storage. This cannot be undone.</p>
              <button onClick={() => setShowDeleteModal(true)} className="btn-danger text-sm py-2 w-full justify-center">
                <Trash2 size={14} /> Delete Document
              </button>
            </div>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full animate-in">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                <Trash2 size={22} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete Document?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete <strong className="text-white">"{doc.title}"</strong>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 justify-center">
                  {deleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />}
                  Yes, Delete
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
