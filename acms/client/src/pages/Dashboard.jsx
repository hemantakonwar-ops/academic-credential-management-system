import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { userService, documentService } from '../services/documentService';
import { FileText, HardDrive, Tag, Clock, Upload, ChevronRight, FileImage, FileBadge } from 'lucide-react';

const CATEGORY_COLORS = {
  'Certificates': 'badge-green',
  'Grade Reports / Mark Sheets': 'badge-yellow',
  'ID Cards': 'badge-blue',
  'Transcripts': 'badge-blue',
  'Achievements': 'badge-green',
  'Internship Documents': 'badge-yellow',
  'Other Academic Records': 'badge-gray',
};

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalDocs: 0, totalStorage: 0 });
  const [recentDocs, setRecentDocs] = useState([]);
  const [categoriesUsed, setCategoriesUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, docsRes] = await Promise.all([
          userService.getMe(),
          documentService.getAll({ limit: 6 }),
        ]);
        setStats(meRes.data.stats);
        const docs = docsRes.data.data;
        setRecentDocs(docs);
        setCategoriesUsed(new Set(docs.map(d => d.category)).size);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Documents', value: stats.totalDocs, icon: FileText, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Storage Used', value: formatBytes(stats.totalStorage), icon: HardDrive, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Categories Used', value: categoriesUsed, icon: Tag, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    {
      label: 'Last Upload',
      value: recentDocs[0] ? formatDate(recentDocs[0].uploadDate) : '—',
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8 animate-in">
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="text-gradient">{user?.fullName?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's an overview of your credential vault</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card animate-in">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-2xl font-bold text-white mt-2">{loading ? '—' : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent uploads */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Recent Uploads</h2>
          <Link to="/documents" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse h-36 bg-dark-700" />
            ))}
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No documents yet</p>
            <p className="text-gray-600 text-sm mt-1">Upload your first credential to get started</p>
            <Link to="/upload" className="btn-primary mt-6 mx-auto">
              <Upload size={16} /> Upload Document
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDocs.map((doc) => (
              <Link
                key={doc._id}
                to={`/documents/${doc._id}`}
                className="card-hover group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-dark-700 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-500/10 transition-colors">
                    {doc.fileType === 'application/pdf'
                      ? <FileText size={20} className="text-red-400" />
                      : <FileImage size={20} className="text-blue-400" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate text-sm">{doc.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.institutionName || 'No institution'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className={`${CATEGORY_COLORS[doc.category] || 'badge-gray'} badge text-[10px]`}>
                    {doc.category}
                  </span>
                  <span className="text-xs text-gray-600">{formatDate(doc.uploadDate)}</span>
                </div>
              </Link>
            ))}
            {/* Upload new card */}
            <Link to="/upload" className="card border-dashed border-2 border-surface-border hover:border-primary-500/40 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-primary-400 transition-all duration-200 min-h-[120px] cursor-pointer">
              <Upload size={24} />
              <span className="text-sm font-medium">Upload New</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
