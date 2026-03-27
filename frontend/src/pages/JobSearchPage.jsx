import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BookmarkButton from "../components/jobs/BookmarkButton";
import ApplyModal from "../components/applications/ApplyModal";
import { useAuth } from "../context/useAuth";

export default function JobSearchPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    location: "",
    job_type: "",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    sort_by: "date",
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    locations: [],
    jobTypes: [],
    experienceLevels: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const isFreelancer = user?.role === 'freelancer';

  const [applyJob, setApplyJob] = useState(null); // job to apply to
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  useEffect(() => {
    loadFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    searchJobs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.sort_by]);

  const loadFilterOptions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/jobs/filter-options",
      );
      setFilterOptions(response.data.filters);
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  };

  const searchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: pagination.limit };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });
      const response = await axios.get(
        "http://localhost:5000/api/jobs/search",
        { params },
      );
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));
  const handleSearch = () => searchJobs(1);
  const clearFilters = () => {
    setFilters({
      keyword: "",
      category: "",
      location: "",
      job_type: "",
      experience_level: "",
      salary_min: "",
      salary_max: "",
      sort_by: "date",
    });
    searchJobs(1);
  };
  const handlePageChange = (newPage) => {
    searchJobs(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Negotiable";
    if (min && max)
      return `$${(min/1000).toFixed(0)}k - $${(max/1000).toFixed(0)}k`;
    if (min) return `From $${(min/1000).toFixed(0)}k`;
    if (max) return `Up to $${(max/1000).toFixed(0)}k`;
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
      if (interval >= 1)
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search Hero Section */}
      <header className="relative bg-surface-container pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-on-surface mb-6 uppercase italic animate-in fade-in slide-in-from-bottom-4">
            Find Your <span className="text-primary">Opportunity</span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl font-medium mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            Access thousands of premium verified jobs and take the next step in your professional career.
          </p>

          {/* Large Search Bar */}
          <div className="bg-surface p-2 rounded-2xl border border-outline flex items-center shadow-2xl max-w-2xl mx-auto group focus-within:border-primary/50 transition-all">
            <div className="pl-6 text-on-surface-variant">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              placeholder="Job title, company, or keywords..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-transparent border-none py-4 px-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none text-lg font-medium"
            />
            <button 
                onClick={handleSearch} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-on-primary px-10 py-4 rounded-xl font-black uppercase tracking-tighter text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden col-span-full">
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full bg-surface p-4 rounded-2xl border border-outline flex items-center justify-center gap-3 text-on-surface font-black uppercase tracking-widest text-[10px]"
            >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-4`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Refine Results</h3>
                <button onClick={clearFilters} className="text-[10px] font-black text-on-surface-variant/60 hover:text-primary uppercase tracking-widest transition-colors">Reset</button>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 px-1 italic">Category</label>
                    <div className="relative">
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/50 transition-all appearance-none"
                        >
                            <option value="">All Categories</option>
                            {filterOptions.categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/60 pointer-events-none text-sm">unfold_more</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 px-1 italic">Location</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/60 text-sm">location_on</span>
                        <input
                            type="text"
                            placeholder="e.g. Remote, NYC..."
                            value={filters.location}
                            onChange={(e) => handleFilterChange("location", e.target.value)}
                            className="w-full bg-surface border border-outline rounded-xl pl-11 pr-4 py-3 text-sm text-on-surface outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 px-1 italic">Contract Type</label>
                    <div className="relative">
                        <select
                            value={filters.job_type}
                            onChange={(e) => handleFilterChange("job_type", e.target.value)}
                            className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-sm text-on-surface outline-none appearance-none focus:border-primary/50"
                        >
                            <option value="">Full Spectrum</option>
                            {filterOptions.jobTypes.map((type) => (
                                <option key={type} value={type}>{type.replace('-', ' ').toUpperCase()}</option>
                            ))}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/60 pointer-events-none text-sm">unfold_more</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 px-1 italic">Salary Range (Min-Max)</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.salary_min}
                            onChange={(e) => handleFilterChange("salary_min", e.target.value)}
                            className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/50"
                        />
                        <span className="text-on-surface-variant/20">—</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.salary_max}
                            onChange={(e) => handleFilterChange("salary_max", e.target.value)}
                            className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/50"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={handleSearch} 
                        className="w-full bg-surface-container hover:bg-on-surface/5 border border-outline rounded-xl py-4 text-[10px] font-black uppercase tracking-widest text-on-surface transition-all active:scale-[0.98]"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </aside>

        {/* Job Listings Grid */}
        <main className="lg:col-span-9 space-y-8">
            <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/60">
                    {loading ? "Searching jobs..." : `${pagination.total} Jobs Found`}
                </span>
                <select 
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange("sort_by", e.target.value)}
                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-primary outline-none cursor-pointer"
                >
                    <option value="date">Newest First</option>
                    <option value="salary_desc">Highest Salary</option>
                    <option value="relevance">Relevant Match</option>
                </select>
            </div>

            {loading ? (
                <div className="py-32 text-center space-y-6">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 animate-pulse italic">Synchronizing Marketplace...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="bg-surface-container p-20 rounded-card border border-outline text-center space-y-4 animate-in fade-in zoom-in-95">
                    <span className="material-symbols-outlined text-on-surface-variant/20 text-7xl italic font-black">manage_search</span>
                    <h3 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter">No Jobs Found</h3>
                    <p className="text-on-surface-variant text-sm font-medium">Try adjusting your filters or search keywords to find more opportunities.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="bg-surface-container p-8 md:p-10 rounded-card border border-outline hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center hover:shadow-2xl hover:shadow-primary/5"
                        >
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-all"></div>
                            
                            <div className="flex-1 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="text-primary text-[10px] font-black uppercase tracking-widest italic">{job.employer_name}</div>
                                        <h3 className="text-2xl font-black text-on-surface group-hover:text-primary transition-colors tracking-tight uppercase italic">{job.title}</h3>
                                    </div>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <BookmarkButton jobId={job.id} size="small" />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 text-on-surface text-[9px] font-black uppercase tracking-widest bg-surface px-4 py-2 rounded-lg border border-outline shadow-sm">
                                        <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                                        {job.location || "Global"}
                                    </div>
                                    <div className="flex items-center gap-2 text-on-surface text-[9px] font-black uppercase tracking-widest bg-surface px-4 py-2 rounded-lg border border-outline shadow-sm">
                                        <span className="material-symbols-outlined text-sm text-primary">work</span>
                                        {job.job_type}
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 px-4 py-2 rounded-lg border border-emerald-500/10 italic">
                                        <span className="material-symbols-outlined text-sm">payments</span>
                                        {formatSalary(job.salary_min, job.salary_max)}
                                    </div>
                                </div>

                                <p className="text-on-surface-variant font-medium text-sm line-clamp-2 max-w-2xl leading-relaxed opacity-80">
                                    {job.description?.replace(/(<([^>]+)>)/gi, "")}
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-6 min-w-[160px] w-full md:w-auto border-t md:border-t-0 md:border-l border-outline pt-6 md:pt-0 md:pl-10">
                                <div className="text-right w-full md:w-auto">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Posted On</div>
                                    <div className="text-[10px] font-black text-on-surface italic uppercase tracking-widest">{timeAgo(job.created_at)}</div>
                                </div>
                                {isFreelancer && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setApplyJob(job);
                                        }}
                                        disabled={appliedJobIds.has(job.id)}
                                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                                            appliedJobIds.has(job.id) 
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                            : 'bg-primary text-on-primary hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20'
                                        }`}
                                    >
                                        {appliedJobIds.has(job.id) ? 'Applied' : 'Apply Now'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="pt-12 flex justify-center items-center gap-6">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-8 py-3 bg-surface border border-outline rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface hover:border-primary/30 disabled:opacity-30 transition-all font-mono shadow-sm"
                            >
                                PREV
                            </button>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 italic">
                                Page {pagination.page} <span className="text-primary italic">of</span> {pagination.totalPages}
                            </div>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={!pagination.hasMore}
                                className="px-8 py-3 bg-surface border border-outline rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface hover:border-primary/30 disabled:opacity-30 transition-all font-mono shadow-sm"
                            >
                                NEXT
                            </button>
                        </div>
                    )}
                </div>
            )}
        </main>
      </div>

      {/* Apply Modal */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={() => {
            setAppliedJobIds((prev) => new Set([...prev, applyJob.id]));
            setApplyJob(null);
          }}
        />
      )}
    </div>
  );
}
