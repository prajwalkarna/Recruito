import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminJobsPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      setError("Access denied. Admin only.");
      return;
    }
    fetchCategories();
    fetchStats();
    fetchJobs();
  }, [user, filters, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories");
      setCategories(response.data.categories);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/jobs/stats",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStats(response.data.stats);
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      const response = await axios.get(
        `http://localhost:5000/api/admin/jobs?${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/admin/jobs/${jobId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccess(response.data.message);
      fetchJobs();
      fetchStats();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update job status");
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this job? This action cannot be undone.",
    );
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Job deleted successfully");
      fetchJobs();
      fetchStats();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete job");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedJobs.length === 0) {
      alert("Please select jobs first");
      return;
    }

    const actionNames = {
      activate: "activate",
      close: "close",
      delete: "delete",
    };

    const confirm = window.confirm(
      `Are you sure you want to ${actionNames[action]} ${selectedJobs.length} job(s)?`,
    );
    if (!confirm) return;

    try {
      await axios.post(
        "http://localhost:5000/api/admin/jobs/bulk-action",
        { action, job_ids: selectedJobs },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccess(`Bulk ${action} completed successfully`);
      setSelectedJobs([]);
      fetchJobs();
      fetchStats();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Bulk action failed");
    }
  };

  const handleSelectJob = (jobId) => {
    if (selectedJobs.includes(jobId)) {
      setSelectedJobs(selectedJobs.filter((id) => id !== jobId));
    } else {
      setSelectedJobs([...selectedJobs, jobId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map((j) => j.id));
    }
  };

  const handleViewDetails = (jobId) => {
    navigate(`/admin/jobs/${jobId}`);
  };

  if (user?.role !== "admin") {
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
            <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-2">
              Job Management
            </h1>
            <p className="text-on-surface-variant font-medium">Monitor and manage all jobs on the Recruito platform.</p>
          </div>
        </div>

        {success && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <span className="material-symbols-outlined">check_circle</span>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="mb-12">
            <h2 className="text-sm font-bold text-on-surface tracking-tight mb-6">Job Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Jobs", value: stats.jobs.total_jobs, icon: "database" },
                { label: "Active Jobs", value: stats.jobs.active_jobs, icon: "bolt" },
                { label: "Closed Jobs", value: stats.jobs.closed_jobs, icon: "lock" },
                { label: "Drafts", value: stats.jobs.draft_jobs, icon: "edit_note" },
                { label: "New (30D)", value: stats.recent_jobs, icon: "new_releases" }
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

        {/* Filters & Actions */}
        <div className="bg-surface-container rounded-card border border-outline p-6 mb-8 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">search</span>
                <input
                    type="text"
                    placeholder="Search by index, title, or employer..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full bg-surface border border-outline rounded-xl pl-12 pr-4 py-3 text-on-surface text-sm outline-none focus:border-primary transition-all"
                />
            </div>

            <div className="flex flex-wrap gap-4">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary transition-all appearance-none min-w-[140px]"
                >
                    <option value="" className="bg-surface-container-high">Any Status</option>
                    <option value="active" className="bg-surface-container-high">Active</option>
                    <option value="pending" className="bg-surface-container-high">Pending</option>
                    <option value="closed" className="bg-surface-container-high">Closed</option>
                    <option value="expired" className="bg-surface-container-high">Expired</option>
                </select>

                <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary transition-all appearance-none min-w-[180px]"
                >
                    <option value="" className="bg-surface-container-high">Any Category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-surface-container-high">
                            {cat.name}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => setFilters({ status: "", category: "", search: "" })}
                    className="px-6 py-3 border border-outline rounded-xl text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface transition-all"
                >
                    Reset Filters
                </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedJobs.length > 0 && (
            <div className="flex items-center gap-4 animate-in slide-in-from-left-4 duration-300">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold border border-primary/20">
                {selectedJobs.length} JOBS SELECTED
              </span>
              <div className="h-4 w-px bg-outline mx-2"></div>
              <div className="flex gap-2">
                <button
                    onClick={() => handleBulkAction("activate")}
                    className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-all"
                >
                    Activate
                </button>
                <button
                    onClick={() => handleBulkAction("close")}
                    className="px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-all"
                >
                    Close
                </button>
                <button
                    onClick={() => handleBulkAction("delete")}
                    className="px-4 py-2 bg-error-container text-on-error-container border border-error-container/50 rounded-lg text-xs font-bold hover:bg-error-container/80 transition-all"
                >
                    Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table Area */}
        <div className="bg-surface-container rounded-card border border-outline overflow-hidden">
          {loading ? (
            <div className="py-32 text-center text-on-surface-variant animate-pulse font-bold text-sm">Loading jobs...</div>
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
                          checked={selectedJobs.length === jobs.length && jobs.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Title & Location</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Employer</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Type</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">Applicants</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Posted Date</th>
                      <th className="p-6 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-surface transition-all group">
                        <td className="p-6">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-outline bg-transparent text-primary focus:ring-primary"
                            checked={selectedJobs.includes(job.id)}
                            onChange={() => handleSelectJob(job.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-on-surface text-sm font-bold group-hover:text-primary transition-colors">{job.title}</span>
                            <span className="text-xs text-on-surface-variant flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                {job.location || "Remote"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-on-surface-variant font-medium">{job.employer_name}</td>
                        <td className="p-4">
                           <span className="text-xs font-bold uppercase tracking-wider border border-outline px-2 py-1 rounded-lg bg-surface text-on-surface-variant">
                                {job.job_type}
                           </span>
                        </td>
                        <td className="p-4">
                          {(() => {
                            const isExpired = job.expires_at && new Date(job.expires_at) < new Date();
                            const displayStatus = isExpired ? 'expired' : job.status;
                            const cls =
                              displayStatus === 'active'  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                              displayStatus === 'expired' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                              displayStatus === 'closed'  ? 'bg-error-container text-on-error-container border-error-container/50' :
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                            return (
                              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${cls}`}>
                                {displayStatus}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-4 text-center">
                            <span className="text-sm font-bold text-on-surface">{job.application_count}</span>
                        </td>
                        <td className="p-4 text-sm text-on-surface-variant">
                            {new Date(job.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-6">
                          <div className="flex justify-end gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleViewDetails(job.id)}
                                className="w-8 h-8 rounded-lg bg-surface border border-outline flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-on-surface-variant"
                                title="View Details"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                            </button>
                            {job.status === "active" ? (
                              <button
                                onClick={() => handleUpdateStatus(job.id, "closed")}
                                className="w-8 h-8 rounded-lg bg-surface border border-outline flex items-center justify-center hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all text-on-surface-variant"
                                title="Close Job"
                              >
                                <span className="material-symbols-outlined text-sm">lock</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(job.id, "active")}
                                className="w-8 h-8 rounded-lg bg-surface border border-outline flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all text-on-surface-variant"
                                title="Activate Job"
                              >
                                <span className="material-symbols-outlined text-sm">bolt</span>
                              </button>
                            )}
                            <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="w-8 h-8 rounded-lg bg-surface border border-outline flex items-center justify-center hover:bg-error-container hover:text-on-error-container transition-all text-on-surface-variant"
                                title="Delete Job"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
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
                    Page <span className="text-primary">{pagination.page}</span> / {pagination.pages} • {pagination.total} Jobs
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
