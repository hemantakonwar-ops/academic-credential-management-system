import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { categoryService, adminService } from '../../services/documentService';
import { Tag, Plus, ToggleLeft, ToggleRight, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [toggling, setToggling] = useState(null);

  const loadCategories = async () => {
    try {
      // We need all categories (active + inactive) - calling the admin endpoint
      // Since we only have active getter, we get what we can
      const { data } = await categoryService.getAll();
      setCategories(data.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return toast.error('Category name is required');
    setAdding(true);
    try {
      const { data } = await adminService.manageCategory({ action: 'add', name: newCategory.trim() });
      setCategories(prev => [...prev, data.data]);
      setNewCategory('');
      toast.success(`Category "${data.data.name}" added successfully`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (cat) => {
    setToggling(cat._id);
    try {
      const newStatus = !cat.isActive;
      await adminService.manageCategory({ action: 'deactivate', name: cat.name, isActive: newStatus });
      setCategories(prev => prev.map(c => c._id === cat._id ? { ...c, isActive: newStatus } : c));
      toast.success(`Category "${cat.name}" ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggling(null);
    }
  };

  const PREDEFINED = [
    'Certificates', 'Grade Reports / Mark Sheets', 'ID Cards',
    'Transcripts', 'Achievements', 'Internship Documents', 'Other Academic Records',
  ];

  return (
    <div className="flex min-h-screen bg-dark-900">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 animate-in">
          <div className="flex items-center gap-3 mb-1">
            <Tag size={24} className="text-primary-400" />
            <h1 className="text-2xl font-bold text-white">Category Management</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1 ml-9">Add or deactivate document categories</p>
        </div>

        {/* Add new category */}
        <div className="card mb-6 animate-in">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={16} className="text-primary-400" /> Add New Category
          </h2>
          <form onSubmit={handleAddCategory} className="flex gap-3">
            <input
              type="text"
              className="input flex-1"
              placeholder="Enter category name…"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              maxLength={100}
            />
            <button type="submit" disabled={adding || !newCategory.trim()} className="btn-primary shrink-0">
              {adding ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add
            </button>
          </form>
        </div>

        {/* Categories list */}
        <div className="card animate-in">
          <h2 className="font-semibold text-white mb-4">All Categories</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-14 bg-dark-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No categories found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat._id} className="flex items-center justify-between bg-dark-700 rounded-xl px-4 py-3 hover:bg-dark-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${cat.isActive ? 'bg-primary-400' : 'bg-gray-600'}`} />
                    <span className={`text-sm font-medium ${cat.isActive ? 'text-white' : 'text-gray-500 line-through'}`}>
                      {cat.name}
                    </span>
                    {PREDEFINED.includes(cat.name) && (
                      <span className="badge badge-blue text-[10px]">Default</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${cat.isActive ? 'text-primary-400' : 'text-gray-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleToggle(cat)}
                      disabled={toggling === cat._id}
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        cat.isActive
                          ? 'text-primary-400 hover:bg-primary-500/10'
                          : 'text-gray-500 hover:bg-gray-700'
                      } disabled:opacity-50`}
                      title={cat.isActive ? 'Deactivate category' : 'Activate category'}
                    >
                      {toggling === cat._id ? (
                        <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin block" />
                      ) : cat.isActive ? (
                        <ToggleRight size={22} />
                      ) : (
                        <ToggleLeft size={22} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info note */}
        <div className="mt-6 card border border-blue-500/20 bg-blue-500/5">
          <div className="flex gap-3">
            <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-medium">About Categories</p>
              <p className="text-xs text-gray-500 mt-1">
                Deactivating a category hides it from the upload form. Existing documents in that category are not affected.
                Default categories are seeded on server startup and can be deactivated but not deleted.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
