// src/pages/employer/MyJobsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyJobs, toggleJobStatus, deleteJob } from "../../api/jobs";
import DeleteJobModal from "../../components/jobs/DeleteJobModal";

const STATUS_STYLES = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dot-emerald",
  closed: "bg-surface text-on-surface-variant border-outline dot-gray",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20 dot-amber",
};

const formatDeadline = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  const label = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return { label, diff };
};

export default function MyJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    jobId: null,
    jobTitle: "",
  });
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const loadJobs = () => {
    setLoading(true);
    fetchMyJobs()
      .then((data) => setJobs(data.jobs))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    try {
      const data = await toggleJobStatus(id);
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: data.job.status } : j)),
      );
      showToast(data.message);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteJob(deleteModal.jobId);
      setJobs((prev) => prev.filter((j) => j.id !== deleteModal.jobId));
      setDeleteModal({ open: false, jobId: null, jobTitle: "" });
      showToast("Job deleted successfully.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl border font-bold text-sm shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-5 duration-300 ${toast.type === 'error' ? 'bg-error-container text-on-error-container border-error/50' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
          <span className="material-symbols-outlined text-lg">{toast.type === "success" ? "check_circle" : "error"}</span>
          {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <DeleteJobModal
          jobTitle={deleteModal.jobTitle}
          onConfirm={handleDelete}
          onCancel={() =>
            setDeleteModal({ open: false, jobId: null, jobTitle: "" })
          }
          loading={deleting}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-container p-8 rounded-card border border-outline relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight uppercase italic font-headline">My Job Listings</h1>
            <p className="text-on-surface-variant font-medium mt-2">
              {loading
                ? "Loading listings..."
                : `${jobs.filter(job => {
                    if (filter === "all") return true;
                    if (filter === "expired") {
                      const deadline = formatDeadline(job.expires_at);
                      return deadline && deadline.diff < 0;
                    }
                    return job.status === filter;
                  }).length} listing${jobs.filter(job => {
                    if (filter === "all") return true;
                    if (filter === "expired") {
                      const deadline = formatDeadline(job.expires_at);
                      return deadline && deadline.diff < 0;
                    }
                    return job.status === filter;
                  }).length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => navigate("/employer/create-job")}
              className="flex items-center gap-2 bg-primary text-on-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Post New Job
            </button>
          </div>
        </div>

        {/* Tabs */}
        {!loading && jobs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {["all", "active", "pending", "closed", "expired"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === tab 
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                  : "bg-surface-container border border-outline text-on-surface hover:border-primary/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
            <div className="flex items-center gap-3 bg-error-container/10 border border-error-container/30 text-error px-4 py-3 rounded-xl text-sm font-medium">
                <span className="material-symbols-outlined">error</span>
                {error}
            </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container p-6 rounded-2xl border border-outline/50 animate-pulse">
                <div className="h-5 bg-surface rounded-md w-1/3 mb-4"></div>
                <div className="h-4 bg-surface rounded-md w-1/2 mb-3"></div>
                <div className="h-4 bg-surface rounded-md w-1/4"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State */
          <div className="bg-surface-container border border-outline rounded-card p-16 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center border border-outline mb-2">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">assignment</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">No jobs posted yet</h2>
            <p className="text-on-surface-variant font-medium">
              Post your first job listing to start receiving applications.
            </p>
            <button
              onClick={() => navigate("/employer/create-job")}
              className="mt-4 px-6 py-3 bg-primary text-on-primary hover:bg-primary/90 transition-all rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.filter(job => {
              if (filter === "all") return true;
              if (filter === "expired") {
                const deadline = formatDeadline(job.expires_at);
                return deadline && deadline.diff < 0;
              }
              return job.status === filter;
            }).length === 0 ? (
              <div className="bg-surface border border-outline border-dashed rounded-card p-12 text-center flex flex-col items-center gap-3">
                 <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">search_off</span>
                 <p className="text-on-surface-variant font-medium">No jobs found for the "{filter}" filter.</p>
              </div>
            ) : jobs.filter(job => {
              if (filter === "all") return true;
              if (filter === "expired") {
                const deadline = formatDeadline(job.expires_at);
                return deadline && deadline.diff < 0;
              }
              return job.status === filter;
            }).map((job) => {
              const statusClasses = STATUS_STYLES[job.status] || STATUS_STYLES.closed;
              const deadline = formatDeadline(job.expires_at);
              const isExpiringSoon = deadline && deadline.diff <= 3;
              const isExpired = deadline && deadline.diff < 0;

              return (
                <div
                  key={job.id}
                  className="bg-surface-container border border-outline hover:border-primary/50 transition-colors duration-300 rounded-2xl p-6 md:p-8"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Title + Status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-4">
                        <h2 className="text-xl font-bold text-on-surface truncate pr-2">{job.title}</h2>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusClasses}`}>
                          {job.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                          {job.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                          {job.status === 'closed' && <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>}
                          {job.status}
                        </span>
                      </div>

                      {/* Meta chips */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {job.category_name && (
                          <span className="inline-flex items-center gap-1.5 bg-surface text-on-surface-variant border border-outline px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px]">category</span> {job.category_name}
                          </span>
                        )}
                        {job.location && (
                          <span className="inline-flex items-center gap-1.5 bg-surface text-on-surface-variant border border-outline px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px]">location_on</span> {job.location}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 bg-surface text-on-surface-variant border border-outline px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px]">work</span> {job.job_type}
                        </span>
                        {(job.salary_min || job.salary_max) && (
                          <span className="inline-flex items-center gap-1.5 bg-surface text-emerald-500/90 border border-outline px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px]">payments</span>
                            {job.salary_min ? `$${Number(job.salary_min).toLocaleString()}` : ""}
                            {job.salary_min && job.salary_max ? " - " : ""}
                            {job.salary_max ? `$${Number(job.salary_max).toLocaleString()}` : ""}
                          </span>
                        )}
                      </div>

                      {/* Stats row */}
                      <div className="flex flex-wrap gap-6 items-center">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">groups</span>
                          {job.applicant_count || 0} applicant{job.applicant_count !== 1 ? "s" : ""}
                        </span>
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          {job.views_count || 0} views
                        </span>
                        {deadline ? (
                          <span
                            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                                isExpired ? "text-error" : isExpiringSoon ? "text-amber-500" : "text-on-surface-variant"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">event</span>
                            {isExpired
                              ? `Expired ${deadline.label}`
                              : `Deadline: ${deadline.label}`}
                            {!isExpired && isExpiringSoon && ` (${deadline.diff}d left)`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px]">event_busy</span>
                            No deadline
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center flex-wrap lg:flex-col lg:items-end gap-3 lg:gap-2 shrink-0 border-t border-outline/50 lg:border-t-0 lg:border-l lg:pl-6 pt-6 lg:pt-0 mt-2 lg:mt-0">
                      <button
                        onClick={() => handleToggleStatus(job.id)}
                        disabled={togglingId === job.id}
                        className={`px-4 py-2 w-full sm:w-auto lg:w-40 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all disabled:opacity-50 ${
                            job.status === "active"
                            ? "border-outline text-on-surface-variant hover:bg-surface"
                            : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                        }`}
                      >
                        {togglingId === job.id
                          ? "Updating..."
                          : job.status === "active"
                            ? "Close Listing"
                            : "Reopen Listing"}
                      </button>
                      <button
                        onClick={() => navigate(`/employer/job/${job.id}/applicants`)}
                        className="px-4 py-2 w-full sm:w-auto lg:w-40 rounded-xl text-xs font-bold uppercase tracking-widest border border-primary/30 text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[14px]">inbox</span>
                        Applicants ({job.applicant_count || 0})
                      </button>
                      <button
                        onClick={() => navigate(`/employer/edit-job/${job.id}`)}
                        className="px-4 py-2 w-full sm:w-auto lg:w-40 rounded-xl text-xs font-bold uppercase tracking-widest border border-outline text-on-surface-variant hover:text-on-surface hover:bg-surface transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            jobId: job.id,
                            jobTitle: job.title,
                          })
                        }
                        className="px-4 py-2 w-full sm:w-auto lg:w-40 rounded-xl text-xs font-bold uppercase tracking-widest border border-error/30 text-error hover:bg-error/10 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
