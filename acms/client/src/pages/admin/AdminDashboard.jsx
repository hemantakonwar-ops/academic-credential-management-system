import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { adminService } from '../../services/documentService';
import {
  Users, FileText, HardDrive, UserX, ArrowUpRight,
  TrendingUp, Shield, Activity
} from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Total Students',
      value: stats?.totalUsers ?? '—',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      gradient: 'from-blue-500/20 to-transparent',
    },
    {
      label: 'Total Documents',
      value: stats?.totalDocuments ?? '—',
      icon: FileText,
      color: 'text-primary-400',
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/20',
      gradient: 'from-primary-500/20 to-transparent',
    },
    {
      label: 'Total Storage',
      value: stats ? formatBytes(stats.totalStorageBytes) : '—',
      icon: HardDrive,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      gradient: 'from-purple-500/20 to-transparent',
    },
    {
      label: 'Suspended Accounts',
      value: stats?.suspendedAccounts ?? '—',
      icon: UserX,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      gradient: 'from-red-500/20 to-transparent',
    },
  ];

  const quickLinks = [
    { to: '/admin/users', label: 'Manage Users', desc: 'View, suspend, or delete student accounts', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { to: '/admin/categories', label: 'Categories', desc: 'Add or deactivate document categories', icon: FileText, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { to: '/admin/audit-logs', label: 'Audit Logs', desc: 'Track all system activity and events', icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="flex min-h-screen bg-dark-900">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8 animate-in">
          <div className="flex items-center gap-3 mb-1">
            <Shield size={24} className="text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1 ml-9">System-wide statistics and management tools</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg, border, gradient }) => (
            <div key={label} className={`stat-card relative overflow-hidden border ${border} animate-in`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`} />
              <div className="relative">
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={22} className={color} />
                </div>
                <p className="text-3xl font-bold text-white mt-3">
                  {loading ? (
                    <span className="inline-block w-16 h-8 bg-dark-700 rounded-lg animate-pulse" />
                  ) : value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickLinks.map(({ to, label, desc, icon: Icon, color, bg }) => (
            <Link key={to} to={to} className="card-hover group cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={20} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white text-sm">{label}</p>
                    <ArrowUpRight size={14} className="text-gray-600 group-hover:text-primary-400 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* System Info */}
        <div className="card border border-surface-border">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <TrendingUp size={14} /> System Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">API Version</p>
              <p className="text-white font-medium">v1.0.0</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Database</p>
              <p className="text-white font-medium">MongoDB Atlas</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">File Storage</p>
              <p className="text-white font-medium">Cloudinary</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Environment</p>
              <p className="text-white font-medium">Development</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
