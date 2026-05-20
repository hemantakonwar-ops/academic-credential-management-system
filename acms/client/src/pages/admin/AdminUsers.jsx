import React, { useEffect, useState, useCallback } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { adminService } from '../../services/documentService';
import {
  Users, Search, UserCheck, UserX, Trash2, ChevronLeft, ChevronRight,
  Shield, AlertTriangle, Mail, Calendar, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const { data } = await adminService.getUsers(params);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handleToggleStatus = async (user) => {
    setActionLoading(user._id);
    try {
      const newStatus = !user.isActive;
      await adminService.updateUserStatus(user._id, newStatus);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: newStatus } : u));
      toast.success(`${user.fullName} ${newStatus ? 'reactivated' : 'suspended'} successfully`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await adminService.deleteUser(deleteModal._id);
      setUsers(prev => prev.filter(u => u._id !== deleteModal._id));
      toast.success('User and all their data permanently deleted');
      setDeleteModal(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-in">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Users size={24} className="text-blue-400" />
              <h1 className="text-2xl font-bold text-white">User Management</h1>
            </div>
            <p className="text-gray-500 text-sm ml-9">{pagination.total} registered student{pagination.total !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              className="input pl-10"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card animate-pulse h-16 bg-dark-700" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="card text-center py-16">
            <Users size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No users found</p>
            <p className="text-gray-600 text-sm mt-1">
              {search ? 'Try a different search term' : 'No students have registered yet'}
            </p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="table-header">User</th>
                    <th className="table-header">Email</th>
                    <th className="table-header hidden md:table-cell">Joined</th>
                    <th className="table-header hidden sm:table-cell">Documents</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-xs shrink-0">
                            {user.fullName?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate max-w-[160px]">{user.fullName}</p>
                            {user.institution && (
                              <p className="text-gray-600 text-xs truncate max-w-[160px]">{user.institution}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-gray-400 text-sm flex items-center gap-1.5">
                          <Mail size={12} className="shrink-0 text-gray-600" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="text-gray-500 text-xs flex items-center gap-1.5">
                          <Calendar size={12} />
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="text-gray-400 text-sm flex items-center gap-1.5">
                          <FileText size={12} className="text-gray-600" />
                          {user.documentCount}
                        </span>
                      </td>
                      <td className="table-cell">
                        {user.isActive ? (
                          <span className="badge badge-green">Active</span>
                        ) : (
                          <span className="badge badge-red">Suspended</span>
                        )}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={actionLoading === user._id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50
                              ${user.isActive
                                ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20'
                                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                              }`}
                            title={user.isActive ? 'Suspend this user' : 'Reactivate this user'}
                          >
                            {actionLoading === user._id ? (
                              <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            ) : user.isActive ? (
                              <><UserX size={12} /> Suspend</>
                            ) : (
                              <><UserCheck size={12} /> Activate</>
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteModal(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all duration-200"
                            title="Permanently delete user"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full animate-in">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete User Account?</h3>
              <p className="text-gray-400 text-sm mb-2">
                You are about to permanently delete <strong className="text-white">{deleteModal.fullName}</strong>'s account.
              </p>
              <p className="text-gray-500 text-xs mb-6">
                This will remove the user, all their {deleteModal.documentCount} document(s), and associated cloud files. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 justify-center">
                  {deleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />}
                  Yes, Delete User
                </button>
                <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
