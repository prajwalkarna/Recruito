import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import axios from "axios";
import BookmarkButton from "../../components/jobs/BookmarkButton";

export default function SavedJobsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/saved-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedJobs(response.data.savedJobs);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Negotiable";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "Just now";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-6">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant animate-pulse">Syncing Saved Items...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
                Saved <span className="text-primary">Jobs</span>
            </h1>
            <p className="text-on-surface-variant font-medium">Manage and track your bookmarked career opportunities.</p>
          </div>
          <div className="flex gap-4">
              <div className="px-6 py-4 bg-surface-container border border-outline rounded-xl flex items-center gap-4 shadow-sm">
                  <span className="text-2xl font-black text-primary italic tracking-tighter">{savedJobs.length}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Jobs Bookmarked</span>
              </div>
              <button onClick={() => navigate("/jobs")} className="px-8 py-4 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">search</span> Browse Marketplace
              </button>
          </div>
        </header>

        {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in fade-in">
                {error}
            </div>
        )}

        {savedJobs.length === 0 ? (
          <div className="bg-surface-container p-20 rounded-card border border-outline flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <span className="material-symbols-outlined text-6xl opacity-10 font-black italic">bookmark</span>
            <div className="space-y-2">
                 <h2 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter">No Saved Jobs</h2>
                 <p className="text-on-surface-variant font-medium text-sm">Explore the marketplace and bookmark jobs that match your skills.</p>
            </div>
            <button
              onClick={() => navigate("/jobs")}
              className="px-8 py-4 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              Browse Jobs Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedJobs.map((job) => (
              <div key={job.id} onClick={() => handleJobClick(job.id)} className="group bg-surface-container p-10 rounded-card border border-outline flex flex-col justify-between hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity">
                    <span className="material-symbols-outlined text-7xl italic font-black text-primary">work</span>
                </div>

                <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                            <h3 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter group-hover:text-primary transition-colors line-clamp-2">{job.title}</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">{job.employer_name}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-surface border border-outline flex items-center justify-center text-on-surface-variant font-black italic group-hover:border-primary/30 group-hover:text-primary transition-all shadow-sm">
                            {job.employer_name.charAt(0)}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-lg bg-surface border border-outline text-[8px] font-black uppercase tracking-widest text-primary">{job.job_type}</span>
                        {job.location && (
                            <span className="px-3 py-1 rounded-lg bg-surface border border-outline text-[8px] font-black uppercase tracking-widest text-on-surface flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[12px] text-primary">location_on</span> {job.location}
                            </span>
                        )}
                        {job.category_name && (
                            <span className="px-3 py-1 rounded-lg bg-surface border border-outline text-[8px] font-black uppercase tracking-widest text-on-surface-variant/60">{job.category_name}</span>
                        )}
                    </div>

                    <p className="text-sm font-medium text-on-surface-variant/80 leading-relaxed line-clamp-3">
                        {job.description?.replace(/(<([^>]+)>)/gi, "")}
                    </p>

                    <div className="pt-8 border-t border-outline flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">Compensation</p>
                            <p className="text-[11px] font-black text-primary italic tracking-tight">{formatSalary(job.salary_min, job.salary_max)}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Saved On</p>
                            <p className="text-[9px] font-black text-on-surface uppercase tracking-widest italic">{new Date(job.saved_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="absolute top-8 right-8" onClick={(e) => e.stopPropagation()}>
                    <BookmarkButton jobId={job.id} size="small" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
