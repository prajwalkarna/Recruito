import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import axios from 'axios';

export default function CategoriesPage() {
    const { token, user } = useAuth();
    
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user?.role !== 'admin') {
            setError('Access denied. Admin only.');
            return;
        }
        fetchCategories();
        fetchStats();
    }, [user]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data.categories);
        } catch (err) {
            console.error('Fetch categories error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5000/api/categories/stats/all',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStats(response.data.stats);
        } catch (err) {
            console.error('Fetch stats error:', err);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
        setError('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingCategory) {
                await axios.put(
                    `http://localhost:5000/api/categories/${editingCategory.id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccess('Category updated successfully');
            } else {
                await axios.post(
                    'http://localhost:5000/api/categories',
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccess('Category created successfully');
            }
            
            handleCloseModal();
            fetchCategories();
            fetchStats();
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (categoryId, jobCount) => {
        if (jobCount > 0) {
            alert(`Cannot delete this category. It has ${jobCount} jobs. Please reassign jobs first.`);
            return;
        }

        const confirm = window.confirm('Are you sure you want to delete this category?');
        if (!confirm) return;

        try {
            await axios.delete(
                `http://localhost:5000/api/categories/${categoryId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('Category deleted successfully');
            fetchCategories();
            fetchStats();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Delete failed');
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center mb-6 border border-error-container/30">
                    <span className="material-symbols-outlined text-on-error-container text-4xl">security</span>
                </div>
                <h1 className="text-3xl font-bold text-on-surface mb-4">Access Denied</h1>
                <p className="text-on-surface-variant max-w-sm">Administrative privileges are required for this page.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-primary animate-pulse">Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-6">
            <div className="section-container max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                            Job <span className="text-primary">Categories</span>
                        </h1>
                        <p className="text-on-surface-variant font-medium mt-2">Manage the platform's job categories.</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="px-8 py-4 bg-primary text-on-primary rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">add</span> Add Category
                    </button>
                </header>

                {success && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <span className="material-symbols-outlined">check_circle</span>
                        {success}
                    </div>
                )}
                {error && (
                    <div className="p-4 rounded-xl bg-error-container border border-error-container/50 text-on-error-container text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Active Categories', value: categories.length, icon: 'category', color: 'primary' },
                        { label: 'Total Jobs', value: stats.reduce((sum, s) => sum + parseInt(s.job_count), 0), icon: 'work', color: 'indigo-500' },
                        { label: 'Active Jobs', value: stats.reduce((sum, s) => sum + parseInt(s.active_jobs), 0), icon: 'bolt', color: 'emerald-500' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-surface-container p-8 rounded-card border border-outline relative overflow-hidden group hover:border-primary/50 transition-all">
                            <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                <span className={`material-symbols-outlined text-6xl text-${stat.color}`}>{stat.icon}</span>
                            </div>
                            <h3 className="text-4xl font-bold text-on-surface tracking-tight">{stat.value}</h3>
                            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mt-2">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Categories Table */}
                <div className="bg-surface-container rounded-card border border-outline overflow-hidden">
                    <div className="p-6 border-b border-outline bg-surface">
                        <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">Category List</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-surface border-b border-outline">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">ID</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">Total Jobs</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">Active Jobs</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline">
                                {categories.map(category => {
                                    const stat = stats.find(s => s.id === category.id);
                                    return (
                                        <tr key={category.id} className="group hover:bg-surface transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">#{category.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-on-surface tracking-tight">{category.name}</div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="text-xs font-medium text-on-surface-variant line-clamp-1 group-hover:line-clamp-none transition-all">{category.description || 'No description provided.'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-bold text-on-surface">{stat?.job_count || 0}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">{stat?.active_jobs || 0}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(category)}
                                                        className="w-8 h-8 rounded-lg bg-surface border border-outline flex items-center justify-center text-on-surface-variant hover:bg-primary/20 hover:text-primary transition-all"
                                                        title="Edit Category"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id, stat?.job_count || 0)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-surface border border-outline ${
                                                            stat?.job_count > 0 
                                                            ? 'opacity-50 cursor-not-allowed' 
                                                            : 'text-on-surface-variant hover:bg-error-container hover:text-on-error-container'
                                                        }`}
                                                        disabled={stat?.job_count > 0}
                                                        title="Delete Category"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Overlay */}
                {showModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center px-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleCloseModal}></div>
                        <div className="relative bg-surface-container w-full max-w-md p-10 rounded-card border border-outline shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-bold text-on-surface tracking-tight mb-8">
                                {editingCategory ? 'Update Category' : 'Add Category'}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Category Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all font-medium"
                                        placeholder="e.g., Software Engineering"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="4"
                                        className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all font-medium"
                                        placeholder="Brief description of the category..."
                                    />
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={handleCloseModal} 
                                        className="flex-1 py-4 bg-surface border border-outline rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-2 py-4 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
                                    >
                                        {editingCategory ? 'Save Changes' : 'Create Category'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}