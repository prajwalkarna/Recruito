import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import BookmarkButton from "../components/jobs/BookmarkButton";
import ApplyModal from "../components/applications/ApplyModal";

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFreelancer = user?.role === 'freelancer';

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      setJob(response.data.job);
    } catch (err) {
      console.error("Error fetching job:", err);
      setError("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Negotiable";
    if (min && max) return `$${(min/1000).toFixed(0)}k - $${(max/1000).toFixed(0)}k`;
    if (min) return `From $${(min/1000).toFixed(0)}k`;
    if (max) return `Up to $${(max/1000).toFixed(0)}k`;
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 px-6">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">Loading Details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-12 px-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center mb-6 border border-error-container/30">
          <span className="material-symbols-outlined text-on-error-container text-4xl">error</span>
        </div>
        <h2 className="text-3xl font-bold text-on-surface mb-4">Job Not Found</h2>
        <p className="text-on-surface-variant font-medium max-w-md">{error || "The job you are looking for does not exist or has been removed."}</p>
        <button onClick={() => navigate('/jobs')} className="mt-8 px-6 py-3 bg-surface border border-outline rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container transition-all">
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Back Navigation */}
        <button 
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider"
        >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Search
        </button>

        {/* Header Section */}
        <div className="bg-surface-container p-8 md:p-12 rounded-card border border-outline relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        {job.employer_picture ? (
                            <img src={`http://localhost:5000${job.employer_picture}`} alt={job.employer_name} className="w-10 h-10 rounded-lg object-cover border border-outline" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-surface border border-outline flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">business</span>
                            </div>
                        )}
                        <span className="text-primary text-sm font-bold uppercase tracking-widest">{job.employer_name}</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight uppercase italic">{job.title}</h1>
                    
                    <div className="flex flex-wrap gap-3 pt-2">
                        <div className="flex items-center gap-2 text-on-surface text-xs font-bold uppercase tracking-widest bg-surface px-4 py-2 rounded-lg border border-outline shadow-sm">
                            <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                            {job.location || "Global Region"}
                        </div>
                        <div className="flex items-center gap-2 text-on-surface text-xs font-bold uppercase tracking-widest bg-surface px-4 py-2 rounded-lg border border-outline shadow-sm">
                            <span className="material-symbols-outlined text-sm text-primary">work</span>
                            {job.job_type}
                        </div>
                        <div className="flex items-center gap-2 text-on-surface text-xs font-bold uppercase tracking-widest bg-surface px-4 py-2 rounded-lg border border-outline shadow-sm">
                            <span className="material-symbols-outlined text-sm text-primary">category</span>
                            {job.category_name || "General"}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                    {isFreelancer && (
                        <button
                            onClick={() => setShowApplyModal(true)}
                            disabled={hasApplied}
                            className={`w-full md:w-48 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                                hasApplied 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                : 'bg-primary text-on-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20'
                            }`}
                        >
                            {hasApplied ? (
                                <>
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Applied
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">send</span>
                                    Apply Now
                                </>
                            )}
                        </button>
                    )}
                    <div className="flex items-center gap-2 w-full">
                        <BookmarkButton jobId={job.id} size="large" className="w-12 h-12 bg-surface border border-outline rounded-xl hover:text-primary transition-all shadow-sm flex items-center justify-center" />
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                {/* Job Description */}
                <div className="bg-surface-container p-8 md:p-10 rounded-card border border-outline shadow-sm">
                    <h2 className="text-sm font-black uppercase tracking-widest text-on-surface mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">description</span>
                        Role Description
                    </h2>
                    <div className="prose prose-invert max-w-none text-on-surface-variant font-medium leading-relaxed font-body">
                        {job.description?.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="mb-4">{paragraph}</p>
                        ))}
                    </div>
                </div>

                {/* Required Skills */}
                {job.required_skills && job.required_skills.length > 0 && (
                    <div className="bg-surface-container p-8 md:p-10 rounded-card border border-outline shadow-sm">
                        <h2 className="text-sm font-black uppercase tracking-widest text-on-surface mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">military_tech</span>
                            Required Skills
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {job.required_skills.map((skill, idx) => (
                                <span key={idx} className="px-5 py-2.5 rounded-xl bg-surface border border-outline text-on-surface text-xs font-bold uppercase tracking-wider shadow-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
                <div className="bg-surface-container p-8 rounded-card border border-outline space-y-6 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4 border-b border-outline pb-4">Overview</h3>
                    
                    <div className="space-y-6">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">Compensation</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">{formatSalary(job.salary_min, job.salary_max)}</span>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">Experience Level</span>
                            <span className="text-on-surface font-bold text-sm uppercase tracking-wider">{job.experience_level || "Any Level"}</span>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">Posted</span>
                            <span className="text-on-surface font-bold text-sm">{timeAgo(job.created_at)}</span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">Views</span>
                            <span className="text-on-surface font-bold text-sm">{job.views_count} Impressions</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setHasApplied(true);
            setShowApplyModal(false);
          }}
        />
      )}
    </div>
  );
}
