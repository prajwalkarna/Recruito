import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminUsersPage() {
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState([]);
    
    // Filters
    const [filters, setFilters] = useState({
        role: '',
        status: '',
        search: ''
    });

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get(
                'http://localhost:5000/api/admin/stats',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStats(response.data.stats);
        } catch (err) {
            console.error('Fetch stats error:', err);
        }
    }, [token]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });

            const response = await axios.get(
                `http://localhost:5000/api/admin/users?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUsers(response.data.users);
            setPagination(response.data.pagination);
        } catch (err) {
            console.error('Fetch users error:', err);
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [token, pagination.page, pagination.limit, filters]);

    useEffect(() => {
        if (user?.role !== 'admin') {
            setError('Access denied. Admin only.');
            return;
        }
        fetchStats();
        fetchUsers();
    }, [user, fetchStats, fetchUsers]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [filters]);

    const handleToggleStatus = async (userId) => {
        try {
            const response = await axios.patch(
                `http://localhost:5000/api/admin/users/${userId}/toggle-status`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess(response.data.message);
            fetchUsers();
            fetchStats();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId) => {
        const confirm = window.confirm(
            'Are you sure you want to delete this user? This action cannot be undone.'
        );
        if (!confirm) return;

        try {
            await axios.delete(
                `http://localhost:5000/api/admin/users/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('User deleted successfully');
            fetchUsers();
            fetchStats();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedUsers.length === 0) {
            alert('Please select users first');
            return;
        }

        const actionNames = {
            activate: 'activate',
            suspend: 'suspend',
            delete: 'delete'
        };

        const confirm = window.confirm(
            `Are you sure you want to ${actionNames[action]} ${selectedUsers.length} user(s)?`
        );
        if (!confirm) return;

        try {
            await axios.post(
                'http://localhost:5000/api/admin/users/bulk-action',
                { action, user_ids: selectedUsers },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess(`Bulk ${action} completed successfully`);
            setSelectedUsers([]);
            fetchUsers();
            fetchStats();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Bulk action failed');
        }
    };

    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    const handleViewDetails = (userId) => {
        navigate(`/admin/users/${userId}`);
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

    return (
        <div className="min-h-screen bg-background pt-28 pb-20 px-6">
            <div className="section-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                            User Management
                        </h1>
                        <p className="text-on-surface-variant font-medium">Monitor and manage all users on the Recruito platform.</p>
                    </div>
                </div>

                {success && (
                    <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-3">
                        <span className="material-symbols-outlined">verified</span>
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-3">
                        <span className="material-symbols-outlined">report</span>
                        {error}
                    </div>
                )}

                {/* Statistics */}
                {stats && (
                    <div className="mb-12">
                        <h2 className="text-sm font-bold text-on-surface tracking-tight mb-6">User Statistics</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                            {[
                                { label: "Total Users", value: stats.users.total_users, icon: "groups_3" },
                                { label: "Freelancers", value: stats.users.freelancers, icon: "engineering" },
                                { label: "Employers", value: stats.users.employers, icon: "corporate_fare" },
                                { label: "Active", value: stats.users.active_users, icon: "sensors" },
                                { label: "Inactive", value: stats.users.inactive_users, icon: "sensors_off" },
                                { label: "New (30D)", value: stats.recent_registrations, icon: "person_add" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-surface-container p-6 rounded-2xl border border-outline flex flex-col items-center text-center gap-2 group hover:border-primary transition-all">
                                    <span className="material-symbols-outlined text-primary">{stat.icon}</span>
                                    <div className="text-2xl font-bold text-on-surface leading-none">{stat.value}</div>
                                    <div className="text-xs font-bold text-on-surface-variant">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-surface-container rounded-card border border-outline p-6 mb-8 flex flex-col gap-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">search</span>
                            <input
                                type="text"
                                placeholder="Search by name, email, or unique ID..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full bg-surface border border-outline rounded-xl pl-12 pr-4 py-3 text-on-surface text-sm outline-none focus:border-primary transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                                className="bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface text-sm outline-none appearance-none min-w-[140px]"
                            >
                                <option value="" className="bg-surface-container-high">All Roles</option>
                                <option value="freelancer" className="bg-surface-container-high">Freelancer</option>
                                <option value="employer" className="bg-surface-container-high">Employer</option>
                                <option value="admin" className="bg-surface-container-high">Admin</option>
                            </select>

                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface text-sm outline-none appearance-none min-w-[140px]"
                            >
                                <option value="" className="bg-surface-container-high">All Status</option>
                                <option value="active" className="bg-surface-container-high">Active</option>
                                <option value="inactive" className="bg-surface-container-high">Inactive</option>
                            </select>

                            <button
                                onClick={() => setFilters({ role: '', status: '', search: '' })}
                                className="px-6 py-3 border border-outline rounded-xl text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface transition-all"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedUsers.length > 0 && (
                        <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-300">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold border border-primary/20">
                                {selectedUsers.length} USERS SELECTED
                            </span>
                            <div className="h-4 w-px bg-outline mx-2"></div>
                            <div className="flex gap-2">
                                <button onClick={() => handleBulkAction('activate')} className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-all">
                                    Activate
                                </button>
                                <button onClick={() => handleBulkAction('suspend')} className="px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-all">
                                    Suspend
                                </button>
                                <button onClick={() => handleBulkAction('delete')} className="px-4 py-2 bg-error-container text-on-error-container border border-error-container/50 rounded-lg text-xs font-bold hover:bg-error-container/80 transition-all">
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Users Table */}
                <div className="bg-surface-container rounded-card border border-outline overflow-hidden">
                    {loading ? (
                        <div className="py-32 text-center text-on-surface-variant animate-pulse font-bold text-sm">Loading users...</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-surface border-b border-outline">
                                        <tr>
                                            <th className="p-6">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-outline bg-transparent text-primary focus:ring-primary"
                                                    checked={selectedUsers.length === users.length && users.length > 0}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">User</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Role</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Activity</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Joined</th>
                                            <th className="p-6 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline">
                                        {users.map(user => (
                                            <tr key={user.id} className="hover:bg-surface transition-all group">
                                                <td className="p-6">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-outline bg-transparent text-primary focus:ring-primary"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={() => handleSelectUser(user.id)}
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full border border-outline p-0.5 overflow-hidden flex-shrink-0">
                                                            {user.profile_picture ? (
                                                                <img src={user.profile_picture} className="w-full h-full rounded-full object-cover" alt={user.name} />
                                                            ) : (
                                                                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center font-bold text-on-primary">
                                                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-on-surface text-sm font-bold truncate group-hover:text-primary transition-colors">{user.name}</span>
                                                            <span className="text-xs text-on-surface-variant truncate">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg border overflow-hidden ${
                                                        user.role === 'freelancer' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                                        user.role === 'employer' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                                                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                                                        user.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-error-container text-on-error-container border-error-container/50'
                                                    }`}>
                                                        {user.is_active ? 'Active' : 'Suspended'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {user.role === 'employer' && (
                                                        <span className="text-xs font-medium text-on-surface-variant">
                                                            {user.jobs_posted} Jobs Posted
                                                        </span>
                                                    )}
                                                    {user.role === 'freelancer' && (
                                                        <span className="text-xs font-medium text-on-surface-variant">
                                                            {user.applications_submitted} Applications | {user.cvs_created} Resumes
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm text-on-surface-variant">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex justify-end gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleViewDetails(user.id)}
                                                            className="w-8 h-8 rounded-lg bg-surface border border-outline flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-on-surface-variant"
                                                            title="View Details"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">visibility</span>
                                                        </button>
                                                        {user.role !== 'admin' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleToggleStatus(user.id)}
                                                                    className={`w-8 h-8 rounded-lg bg-surface border border-outline flex items-center justify-center transition-all text-on-surface-variant ${
                                                                        user.is_active ? 'hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400' : 'hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400'
                                                                    }`}
                                                                    title={user.is_active ? 'Suspend User' : 'Activate User'}
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">{user.is_active ? 'pause' : 'play_arrow'}</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="w-8 h-8 rounded-lg bg-surface border border-outline flex items-center justify-center hover:bg-error-container hover:text-on-error-container transition-all text-on-surface-variant"
                                                                    title="Delete User"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="p-6 bg-surface border-t border-outline flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="text-sm font-bold text-on-surface-variant">
                                    Page <span className="text-primary">{pagination.page}</span> / {pagination.pages} • {pagination.total} Users
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                        disabled={pagination.page === 1}
                                        className="px-6 py-2 bg-surface border border-outline rounded-xl text-sm font-bold hover:bg-surface-container-high text-on-surface disabled:opacity-30 transition-all"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                        disabled={pagination.page === pagination.pages}
                                        className="px-6 py-2 bg-surface border border-outline rounded-xl text-sm font-bold hover:bg-surface-container-high text-on-surface disabled:opacity-30 transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}