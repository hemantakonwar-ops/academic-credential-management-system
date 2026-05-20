import React, { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { adminService } from '../../services/documentService';
import {
  ScrollText, Search, Filter, Calendar, ChevronLeft, ChevronRight,
  User, LogIn, LogOut, Upload, Trash2, UserX, UserCheck, Tag, Edit, Key, X, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const ACTION_ICONS = {
  REGISTER: { icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  LOGIN: { icon: LogIn, color: 'text-green-400', bg: 'bg-green-500/10' },
  LOGOUT: { icon: LogOut, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  LOGIN_FAILED: { icon: Key, color: 'text-red-400', bg: 'bg-red-500/10' },
  UPLOAD: { icon: Upload, color: 'text-primary-400', bg: 'bg-primary-500/10' },
  DELETE_DOCUMENT: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10' },
  UPDATE_DOCUMENT: { icon: Edit, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  UPDATE_PROFILE: { icon: User, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  CHANGE_PASSWORD: { icon: Key, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  DELETE_ACCOUNT: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10' },
  FORGOT_PASSWORD: { icon: Key, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  RESET_PASSWORD: { icon: Key, color: 'text-green-400', bg: 'bg-green-500/10' },
  SUSPEND_USER: { icon: UserX, color: 'text-red-400', bg: 'bg-red-500/10' },
  REACTIVATE_USER: { icon: UserCheck, color: 'text-green-400', bg: 'bg-green-500/10' },
  DELETE_USER: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10' },
  ADD_CATEGORY: { icon: Tag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  DEACTIVATE_CATEGORY: { icon: Tag, color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

const ACTION_LABELS = [
  'All', 'REGISTER', 'LOGIN', 'LOGIN_FAILED', 'UPLOAD', 'DELETE_DOCUMENT',
  'UPDATE_DOCUMENT', 'UPDATE_PROFILE', 'CHANGE_PASSWORD', 'DELETE_ACCOUNT',
  'SUSPEND_USER', 'REACTIVATE_USER', 'DELETE_USER', 'ADD_CATEGORY',
];

function formatTimestamp(d) {
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (action !== 'All') params.action = action;
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await adminService.getAuditLogs(params);
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [action, from, to, page]);

  useEffect(() => { load(); }, [load]);

  const clearFilters = () => {
    setAction('All');
    setFrom('');
    setTo('');
    setPage(1);
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-6 animate-in">
          <div className="flex items-center gap-3 mb-1">
            <ScrollText size={24} className="text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1 ml-9">Track all system activity and user events</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary px-3 ${showFilters ? 'border-primary-500/50 text-primary-400' : ''}`}
            >
              <Filter size={16} /> <span className="hidden sm:inline">Filters</span>
            </button>
            <select
              className="input text-sm bg-dark-700 max-w-[200px]"
              value={action}
              onChange={e => { setAction(e.target.value); setPage(1); }}
            >
              {ACTION_LABELS.map(a => (
                <option key={a} value={a}>{a === 'All' ? 'All Actions' : a.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {(action !== 'All' || from || to) && (
              <button onClick={clearFilters} className="btn-secondary text-sm py-2.5">
                <X size={14} /> Clear
              </button>
            )}
          </div>

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
            </div>
          )}
        </div>

        {/* Logs */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="card animate-pulse h-16 bg-dark-700" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="card text-center py-16">
            <ScrollText size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No audit logs found</p>
            <p className="text-gray-600 text-sm mt-1">
              {action !== 'All' || from || to ? 'Try adjusting your filters' : 'No system events recorded yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => {
              const actionInfo = ACTION_ICONS[log.action] || { icon: Shield, color: 'text-gray-400', bg: 'bg-gray-500/10' };
              const Icon = actionInfo.icon;

              return (
                <div key={log._id} className="card py-3 px-4 flex items-center gap-4 hover:border-surface-border/80 transition-colors">
                  {/* Action icon */}
                  <div className={`w-9 h-9 ${actionInfo.bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={actionInfo.color} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${actionInfo.bg} ${actionInfo.color}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      {log.userId && (
                        <span className="text-xs text-gray-500">
                          by <span className="text-gray-300 font-medium">
                            {typeof log.userId === 'object' ? log.userId.fullName || log.userId.email : 'Unknown'}
                          </span>
                        </span>
                      )}
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {JSON.stringify(log.details).slice(0, 120)}
                      </p>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                    {log.ipAddress && log.ipAddress !== 'unknown' && (
                      <p className="text-[10px] text-gray-600 mt-0.5">IP: {log.ipAddress}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
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
