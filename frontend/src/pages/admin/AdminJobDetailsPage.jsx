import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminJobDetailsPage() {
  const { token, user: currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      setError("Access denied. Admin only.");
      return;
    }
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/jobs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setJob(response.data.job);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/admin/jobs/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccess(response.data.message);
      fetchJobDetails();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleDeleteJob = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this job? This action cannot be undone.",
    );
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/admin/jobs", {
        state: { message: "Job deleted successfully" },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete job");
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="glass-panel p-12 rounded-card border border-red-500/20 max-w-md space-y-6">
              <span className="material-symbols-outlined text-red-500 text-6xl">lock_open</span>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Access Inhibited</h1>
              <p className="text-on-surface-variant uppercase text-xs font-bold tracking-[0.2em]">This terminal is restricted to level 1 admin protocols.</p>
          </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-[10px] uppercase font-black tracking-widest text-primary animate-pulse">Syncing Matrix...</p>
          </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="glass-panel p-12 rounded-card border border-white/10 max-w-md space-y-6">
              <span className="material-symbols-outlined text-white/20 text-6xl">search_off</span>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Node Not Found</h2>
              <button 
                onClick={() => navigate("/admin/jobs")}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all font-medium"
              >
                  Return to Registry
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
                <button onClick={() => navigate("/admin/jobs")} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors group">
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Return to Registry
                </button>
                <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-white uppercase italic">
                    Node <span className="text-primary">Analysis</span>
                </h1>
            </div>
            
            <div className="flex items-center gap-4">
                {job.status === "active" ? (
                    <button onClick={() => handleUpdateStatus("closed")} className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">lock</span> Suspend Stream
                    </button>
                ) : (
                    <button onClick={() => handleUpdateStatus("active")} className="px-6 py-4 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">bolt</span> Reactivate Node
                    </button>
                )}
                <button onClick={handleDeleteJob} className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">delete_forever</span> Purge Node
                </button>
            </div>
        </header>

        {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {success}
            </div>
        )}
        {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {error}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Main Job Card */}
                <section className="glass-panel p-10 rounded-card border border-white/5 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <span className="material-symbols-outlined text-9xl text-white">analytics</span>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                job.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                {job.status}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest">
                                {job.job_type}
                            </span>
                            {job.category_name && (
                                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                                    {job.category_name}
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{job.title}</h2>
                        <p className="text-on-surface-variant font-bold uppercase text-[10px] tracking-[0.2em] italic">
                            Origin: <span className="text-white">{job.employer_name}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Encryption (ID)</span>
                            <p className="text-xs font-mono text-white/60">0x{job.id}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Coordinates</span>
                            <p className="text-xs font-black text-white uppercase tracking-tight">{job.location || 'Distributed'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Experience</span>
                            <p className="text-xs font-black text-white uppercase tracking-tight">{job.experience_level || 'Generalist'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Compensation</span>
                            <p className="text-xs font-black text-white uppercase tracking-tight">
                                {job.salary_min && job.salary_max
                                ? `$${(job.salary_min/1000).toFixed(0)}K - $${(job.salary_max/1000).toFixed(0)}K`
                                : "Unspecified"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Timestamp</span>
                            <p className="text-xs font-black text-white uppercase tracking-tight">{new Date(job.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </section>

                {/* Description */}
                <section className="glass-panel p-10 rounded-card border border-white/5 space-y-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic border-b border-white/5 pb-4">Payload (Description)</h3>
                    <div className="prose prose-invert max-w-none text-on-surface-variant text-sm font-medium leading-relaxed">
                        {job.description}
                    </div>
                </section>

                {/* Skills */}
                {job.required_skills && (
                    <section className="glass-panel p-10 rounded-card border border-white/5 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic border-b border-white/5 pb-4">Protocol Requirements (Skills)</h3>
                        <div className="flex flex-wrap gap-3">
                            {JSON.parse(job.required_skills).map((skill, index) => (
                                <span key={index} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <aside className="space-y-8">
                {/* Application Stats */}
                {job.applications && (
                    <section className="glass-panel p-8 rounded-card border border-white/5 space-y-8">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest italic border-b border-white/5 pb-4">Telemetry</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Total Syncs', value: job.applications.total_applications, icon: 'groups' },
                                { label: 'In Queue', value: job.applications.pending, icon: 'hourglass_empty', color: 'text-amber-400' },
                                { label: 'Shortlisted', value: job.applications.shortlisted, icon: 'grade', color: 'text-primary' },
                                { label: 'Accepted', value: job.applications.accepted, icon: 'check_circle', color: 'text-emerald-400' },
                                { label: 'Rejected', value: job.applications.rejected, icon: 'cancel', color: 'text-red-400' }
                            ].map((stat, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-sm ${stat.color || 'text-white/20'}`}>{stat.icon}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-mono font-black text-white">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Origin Source */}
                <section className="glass-panel p-8 rounded-card border border-white/5 space-y-6">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest italic border-b border-white/5 pb-4">Origin Source</h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Entity Name</span>
                            <p className="text-xs font-black text-white uppercase tracking-tight">{job.employer_name}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Communication Line</span>
                            <p className="text-xs font-medium text-primary underline truncate">{job.employer_email}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Voice Frequency</span>
                            <p className="text-xs font-black text-white tracking-tight">{job.employer_phone || 'Inactive'}</p>
                        </div>
                        <button className="w-full py-3 mt-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all font-medium">
                            Profile Signal
                        </button>
                    </div>
                </section>
            </aside>
        </div>
      </div>
    </div>
  );
}
