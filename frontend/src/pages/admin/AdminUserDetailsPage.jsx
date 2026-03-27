import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminUserDetailsPage() {
  const { token, user: currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      setError("Access denied. Admin only.");
      return;
    }
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUser(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/admin/users/${id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccess(response.data.message);
      fetchUserDetails();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleDeleteUser = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone.",
    );
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/admin/users", {
        state: { message: "User deleted successfully" },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user");
    }
  };

  if (currentUser?.role !== "admin") {
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
              <p className="text-sm font-bold text-primary animate-pulse">Loading user...</p>
          </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="bg-surface-container p-12 rounded-card border border-outline max-w-md space-y-6">
              <span className="material-symbols-outlined text-on-surface-variant text-6xl">person_off</span>
              <h2 className="text-2xl font-bold text-on-surface">User Not Found</h2>
              <button 
                onClick={() => navigate("/admin/users")}
                className="px-8 py-3 bg-surface border border-outline rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all"
              >
                  Back to Users
              </button>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="section-container max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
                <button onClick={() => navigate("/admin/users")} className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors group">
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Back to Users
                </button>
                <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
                    User <span className="text-primary">Profile</span>
                </h1>
            </div>
            
            {user.role !== "admin" && (
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleToggleStatus} 
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            user.is_active 
                            ? "bg-surface border border-outline text-on-surface hover:bg-error-container hover:text-on-error-container" 
                            : "bg-primary text-on-primary hover:bg-primary/90"
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">{user.is_active ? "block" : "check_circle"}</span>
                        {user.is_active ? "Suspend User" : "Activate User"}
                    </button>
                    <button onClick={handleDeleteUser} className="px-6 py-3 bg-error-container text-on-error-container border border-error-container/50 rounded-xl text-sm font-bold hover:bg-error-container/80 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">delete</span> Delete User
                    </button>
                </div>
            )}
        </header>

        {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-3">
                <span className="material-symbols-outlined">check_circle</span>
                {success}
            </div>
        )}
        {error && (
            <div className="p-4 rounded-xl bg-error-container border border-error-container/50 text-on-error-container text-sm font-bold flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                {error}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Profile Identity Card */}
                <section className="bg-surface-container p-10 rounded-card border border-outline space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <span className="material-symbols-outlined text-9xl text-on-surface">fingerprint</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="w-32 h-32 rounded-full border-4 border-surface shadow-md flex items-center justify-center font-bold text-on-primary bg-primary text-5xl overflow-hidden">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="space-y-4 text-center md:text-left">
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                    user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' : 
                                    user.role === 'employer' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' : 
                                    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                }`}>
                                    {user.role}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                    user.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-error-container text-on-error-container border-error-container/50'
                                }`}>
                                    {user.is_active ? 'Active' : 'Suspended'}
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight leading-none">{user.name}</h2>
                            <p className="text-on-surface-variant text-sm font-medium">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-outline">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-sm">badge</span> User ID</span>
                            <p className="text-sm font-medium text-on-surface truncate">#{user.id}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-sm">call</span> Phone</span>
                            <p className="text-sm font-medium text-on-surface tracking-tight">{user.phone || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> Joined</span>
                            <p className="text-sm font-medium text-on-surface tracking-tight">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-sm">update</span> Last Updated</span>
                            <p className="text-sm font-medium text-on-surface tracking-tight">{new Date(user.updated_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </section>

                {/* Biography */}
                {user.bio && (
                    <section className="bg-surface-container p-10 rounded-card border border-outline space-y-6">
                        <h3 className="text-sm font-bold text-on-surface tracking-tight border-b border-outline pb-4">User Bio</h3>
                        <div className="text-on-surface text-sm leading-relaxed">
                            {user.bio}
                        </div>
                    </section>
                )}
            </div>

            <aside className="space-y-8">
                {/* Role-specific Statistics */}
                <section className="bg-surface-container p-8 rounded-card border border-outline space-y-8">
                    <h3 className="text-sm font-bold text-on-surface tracking-tight border-b border-outline pb-4">Activity Overview</h3>
                    
                    {user.role === "employer" && user.jobs && (
                        <div className="space-y-6">
                            {[
                                { label: 'Total Jobs', value: user.jobs.total_jobs, icon: 'work' },
                                { label: 'Active Jobs', value: user.jobs.active_jobs, icon: 'bolt', color: 'text-emerald-500' },
                                { label: 'Closed Jobs', value: user.jobs.closed_jobs, icon: 'lock', color: 'text-on-surface-variant' },
                                { label: 'Applications Received', value: user.applications_received, icon: 'inbox', color: 'text-primary' }
                            ].map((stat, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-sm w-4 h-4 flex items-center justify-center ${stat.color || 'text-on-surface-variant'}`}>{stat.icon}</span>
                                        <span className="text-xs font-bold text-on-surface-variant">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-on-surface">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {user.role === "freelancer" && user.applications && (
                        <div className="space-y-6">
                            {[
                                { label: 'Applications', value: user.applications.total_applications, icon: 'send' },
                                { label: 'Accepted', value: user.applications.accepted, icon: 'verified', color: 'text-primary' },
                                { label: 'Resumes Created', value: user.cvs, icon: 'description', color: 'text-indigo-500' },
                                { label: 'Portfolio Items', value: user.portfolio_items, icon: 'inventory_2', color: 'text-emerald-500' }
                            ].map((stat, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-sm w-4 h-4 flex items-center justify-center ${stat.color || 'text-on-surface-variant'}`}>{stat.icon}</span>
                                        <span className="text-xs font-bold text-on-surface-variant">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-on-surface">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="bg-surface-container p-8 rounded-card border border-outline space-y-6">
                    <h3 className="text-sm font-bold text-on-surface tracking-tight border-b border-outline pb-4">Account Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-surface border border-outline rounded-xl">
                            <span className="text-xs font-bold text-on-surface-variant">Account Standing</span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Good</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-surface border border-outline rounded-xl">
                            <span className="text-xs font-bold text-on-surface-variant">Email Verification</span>
                            <span className="text-xs font-bold text-primary">Verified</span>
                        </div>
                    </div>
                </section>
            </aside>
        </div>
      </div>
    </div>
  );
}
