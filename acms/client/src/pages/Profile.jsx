import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/documentService';
import { User, Mail, Building, Lock, Trash2, Save, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', institution: user?.institution || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.fullName.trim()) return toast.error('Full name is required');
    setSavingProfile(true);
    try {
      const { data } = await userService.updateMe(profile);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.message); }
    finally { setSavingProfile(false); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (pw.newPassword !== pw.confirmPassword) return toast.error('Passwords do not match');
    setSavingPw(true);
    try {
      await userService.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed! Please log in again.');
      logout();
      navigate('/login');
    } catch (err) { toast.error(err.message); }
    finally { setSavingPw(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userService.deleteMe();
      toast.success('Account permanently deleted.');
      logout();
      navigate('/');
    } catch (err) { toast.error(err.message); setDeleting(false); }
  };

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
        </div>

        <div className="space-y-6 animate-in">
          {/* Avatar */}
          <div className="card flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-400 text-2xl font-bold shrink-0">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">{user?.fullName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="badge badge-green mt-1">{user?.role}</span>
            </div>
          </div>

          {/* Profile form */}
          <div className="card">
            <h2 className="font-semibold text-white mb-5">Personal Information</h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="label" htmlFor="fullName">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input id="fullName" className="input pl-10" maxLength={100}
                    value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" className="input pl-10 opacity-60 cursor-not-allowed" value={user?.email} readOnly />
                </div>
                <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="label" htmlFor="institution">Institution</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input id="institution" className="input pl-10" maxLength={150} placeholder="Your university or college"
                    value={profile.institution} onChange={e => setProfile(p => ({ ...p, institution: e.target.value }))} />
                </div>
              </div>
              <button type="submit" disabled={savingProfile} className="btn-primary">
                {savingProfile ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="card">
            <h2 className="font-semibold text-white mb-5">Change Password</h2>
            <form onSubmit={handlePwChange} className="space-y-4">
              {[
                { id: 'currentPassword', label: 'Current Password' },
                { id: 'newPassword', label: 'New Password' },
                { id: 'confirmPassword', label: 'Confirm New Password' },
              ].map(({ id, label }) => (
                <div key={id}>
                  <label htmlFor={id} className="label">{label}</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input id={id} type={showPw ? 'text' : 'password'} className="input pl-10 pr-10"
                      placeholder="••••••••" value={pw[id]}
                      onChange={e => setPw(p => ({ ...p, [id]: e.target.value }))} />
                    {id === 'newPassword' && (
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="submit" disabled={savingPw} className="btn-primary">
                {savingPw ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={16} />}
                Change Password
              </button>
            </form>
          </div>

          {/* Danger zone */}
          <div className="card border border-red-500/20 bg-red-500/5">
            <h2 className="font-semibold text-red-400 mb-2 flex items-center gap-2"><AlertTriangle size={16} />Danger Zone</h2>
            <p className="text-sm text-gray-500 mb-4">
              Permanently delete your account and all associated documents. This cannot be undone.
            </p>
            <button onClick={() => setShowDeleteModal(true)} className="btn-danger">
              <Trash2 size={16} /> Delete My Account
            </button>
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full animate-in">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                <Trash2 size={22} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete Account?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This will <strong className="text-red-400">permanently delete your account</strong> and all your documents from cloud storage. Are you absolutely sure?
              </p>
              <div className="flex gap-3">
                <button onClick={handleDeleteAccount} disabled={deleting} className="btn-danger flex-1 justify-center">
                  {deleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />}
                  Yes, Delete Everything
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
