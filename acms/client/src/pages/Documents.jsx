import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { documentService } from '../services/documentService';
import {
  Search, Grid3X3, List, Upload, FileText, FileImage,
  Filter, Calendar, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Certificates', 'Grade Reports / Mark Sheets', 'ID Cards', 'Transcripts', 'Achievements', 'Internship Documents', 'Other Academic Records'];
const CATEGORY_COLORS = {
  'Certificates': 'badge-green', 'Grade Reports / Mark Sheets': 'badge-yellow',
  'ID Cards': 'badge-blue', 'Transcripts': 'badge-blue',
  'Achievements': 'badge-green', 'Internship Documents': 'badge-yellow', 'Other Academic Records': 'badge-gray',
};

function formatBytes(b) {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
}
function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await documentService.getAll(params);
      setDocs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category, from, to, page]);

  useEffect(() => { load(); }, [load]);

  const clearFilters = () => { setSearch(''); setCategory('All'); setFrom(''); setTo(''); setPage(1); };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Documents</h1>
            <p className="text-gray-500 text-sm mt-0.5">{pagination.total} credential{pagination.total !== 1 ? 's' : ''} in your vault</p>
          </div>
          <Link to="/upload" className="btn-primary shrink-0"><Upload size={16} /> Upload New</Link>
        </div>

        {/* Search + controls */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                className="input pl-10"
                placeholder="Search titles and remarks…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary px-3 ${showFilters ? 'border-primary-500/50 text-primary-400' : ''}`}>
              <Filter size={16} /> <span className="hidden sm:inline">Filters</span>
            </button>
            <div className="flex rounded-xl border border-surface-border overflow-hidden">
              <button onClick={() => setView('grid')} className={`px-3 py-2 ${view === 'grid' ? 'bg-primary-500/15 text-primary-400' : 'text-gray-500 hover:text-white'} transition-colors`}>
                <Grid3X3 size={16} />
              </button>
              <button onClick={() => setView('list')} className={`px-3 py-2 ${view === 'list' ? 'bg-primary-500/15 text-primary-400' : 'text-gray-500 hover:text-white'} transition-colors`}>
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="card flex flex-wrap gap-3 items-end animate-in">
              <div className="flex-1 min-w-36">
                <label className="label text-xs">From Date</label>
                <input type="date" className="input text-sm" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} />
              </div>
              <div className="flex-1 min-w-36">
                <label className="label text-xs">To Date</label>
                <input type="date" className="input text-sm" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} />
              </div>
              <button onClick={clearFilters} className="btn-secondary text-sm py-2.5">
                <X size={14} /> Clear
              </button>
            </div>
          )}

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
                className={`chip ${category === cat ? 'active' : ''}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
            {[...Array(8)].map((_, i) => <div key={i} className="card animate-pulse h-40 bg-dark-700" />)}
          </div>
        ) : docs.length === 0 ? (
          <div className="card text-center py-20">
            <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No documents found</p>
            <p className="text-gray-600 text-sm mt-1">
              {search || category !== 'All' || from || to ? 'Try adjusting your filters' : 'Upload your first credential to get started'}
            </p>
            {!(search || category !== 'All' || from || to) && (
              <Link to="/upload" className="btn-primary mt-6 mx-auto"><Upload size={16} /> Upload Document</Link>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {docs.map(doc => (
              <Link key={doc._id} to={`/documents/${doc._id}`} className="card-hover group">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-dark-700 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-500/10 transition-colors">
                    {doc.fileType === 'application/pdf' ? <FileText size={18} className="text-red-400" /> : <FileImage size={18} className="text-blue-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{doc.institutionName || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`badge text-[10px] ${CATEGORY_COLORS[doc.category] || 'badge-gray'}`}>{doc.category}</span>
                  <span className="text-xs text-gray-600">{formatDate(doc.uploadDate)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">{formatBytes(doc.fileSizeBytes)}</p>
              </Link>
            ))}
            <Link to="/upload" className="card border-dashed border-2 border-surface-border hover:border-primary-500/40 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-primary-400 transition-all min-h-[140px] cursor-pointer">
              <Upload size={22} /><span className="text-sm font-medium">Upload New</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map(doc => (
              <Link key={doc._id} to={`/documents/${doc._id}`}
                className="card-hover flex items-center gap-4 py-3">
                <div className="w-9 h-9 bg-dark-700 rounded-lg flex items-center justify-center shrink-0">
                  {doc.fileType === 'application/pdf' ? <FileText size={16} className="text-red-400" /> : <FileImage size={16} className="text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                  <p className="text-xs text-gray-500">{doc.institutionName || '—'}</p>
                </div>
                <span className={`badge text-[10px] hidden sm:inline-flex ${CATEGORY_COLORS[doc.category] || 'badge-gray'}`}>{doc.category}</span>
                <span className="text-xs text-gray-600 hidden md:block">{formatBytes(doc.fileSizeBytes)}</span>
                <span className="text-xs text-gray-600 shrink-0">{formatDate(doc.uploadDate)}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-2 disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-400">Page {page} of {pagination.pages}</span>
            <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-2 disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
