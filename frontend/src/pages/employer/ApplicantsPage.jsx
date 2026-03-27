import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import axios from "axios";
import StatusBadge from "../../components/applications/StatusBadge";

export default function ApplicantsPage() {
  const { jobId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    skills: "",
    sort_by: "date",
  });
  const [selectedApplicants, setSelectedApplicants] = useState([]);

  useEffect(() => {
    fetchApplicants();
  }, [jobId, filters]);

  const fetchApplicants = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.skills) params.append("skills", filters.skills);
      params.append("sort_by", filters.sort_by);

      const response = await axios.get(
        `http://localhost:5000/api/applications/job/${jobId}/applicants?${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setApplicants(response.data.applicants);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchApplicants();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleBulkAction = async (status) => {
    if (selectedApplicants.length === 0) {
      alert("Please select applicants first");
      return;
    }

    if (!window.confirm(`Update ${selectedApplicants.length} applications to ${status}?`)) {
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/applications/bulk/status",
        { applicationIds: selectedApplicants, status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedApplicants([]);
      fetchApplicants();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update applications");
    }
  };

  const toggleSelectApplicant = (id) => {
    setSelectedApplicants((prev) =>
      prev.includes(id) ? prev.filter((appId) => appId !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedApplicants.length === applicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(applicants.map((app) => app.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-6 text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-primary animate-pulse italic">Scanning Candidates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-outline">
            <div className="space-y-4">
                <button onClick={() => navigate("/employer/my-jobs")} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors group">
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Dashboard
                </button>
                <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
                    Applicant <span className="text-primary">Review</span>
                </h1>
                <p className="text-on-surface-variant font-medium text-sm lg:text-base opacity-70">Review and process applications for your open positions.</p>
            </div>
        </header>

        {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in italic">
                {error}
            </div>
        )}

        {/* Filters & Controls */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-surface-container border border-outline p-8 rounded-card relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-on-surface">filter_alt</span>
            </div>
            
            <div className="flex flex-wrap gap-6 relative z-10 w-full lg:w-auto">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 block px-1">Application Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="bg-surface border border-outline rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-on-surface outline-none focus:border-primary/50 transition-all cursor-pointer shadow-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="space-y-2 flex-1 min-w-[200px]">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 block px-1">Skill Search</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="FILTER BY SKILLS..."
                            value={filters.skills}
                            onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                            className="w-full bg-surface border border-outline rounded-xl pl-12 pr-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-on-surface outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant/40 shadow-sm"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 block px-1">Sort By</label>
                    <select
                        value={filters.sort_by}
                        onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
                        className="bg-surface border border-outline rounded-xl px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-on-surface outline-none focus:border-primary/50 transition-all cursor-pointer shadow-sm"
                    >
                        <option value="date">Date Applied</option>
                        <option value="name">Applicant Name</option>
                        <option value="status">Status</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedApplicants.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-primary/5 border border-primary/20 p-4 rounded-xl animate-in fade-in zoom-in-95 shadow-inner">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-2 italic">
                        {selectedApplicants.length} Selected
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => handleBulkAction("shortlisted")} className="px-5 py-2.5 bg-surface hover:bg-surface-container-high text-[9px] font-black uppercase tracking-widest text-on-surface rounded-lg transition-all border border-outline hover:border-indigo-500/50 hover:text-indigo-500 shadow-sm">Shortlist</button>
                        <button onClick={() => handleBulkAction("accepted")} className="px-5 py-2.5 bg-surface hover:bg-surface-container-high text-[9px] font-black uppercase tracking-widest text-on-surface rounded-lg transition-all border border-outline hover:border-emerald-500/50 hover:text-emerald-500 shadow-sm">Accept</button>
                        <button onClick={() => handleBulkAction("rejected")} className="px-5 py-2.5 bg-surface hover:bg-surface-container-high text-[9px] font-black uppercase tracking-widest text-on-surface rounded-lg transition-all border border-outline hover:border-red-500/50 hover:text-red-500 shadow-sm">Reject</button>
                    </div>
                </div>
            )}
        </div>

        {/* Applicants Grid/List */}
        <div className="space-y-4">
            {applicants.length === 0 ? (
                <div className="bg-surface-container p-24 rounded-card border border-outline flex flex-col items-center justify-center text-center space-y-6 text-on-surface-variant/40 italic shadow-sm">
                    <span className="material-symbols-outlined text-6xl opacity-50">person_search</span>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-2 text-on-surface">Zero Results Found</p>
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em]">No candidates match the current filter parameters.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-surface-container rounded-card border border-outline overflow-hidden shadow-sm">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-outline bg-surface-container-high">
                                    <th className="px-6 py-5 w-12">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedApplicants.length === applicants.length && applicants.length > 0}
                                                onChange={selectAll}
                                                className="w-4 h-4 rounded appearance-none bg-surface border border-outline checked:bg-primary checked:border-primary flex items-center justify-center transition-all cursor-pointer shadow-sm relative before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMCA2IDkgMTcgNCAxMiI+PC9wb2x5bGluZT48L3N2Zz4=')] before:bg-[length:10px] before:bg-center before:bg-no-repeat before:opacity-0 checked:before:opacity-100"
                                            />
                                        </div>
                                    </th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Applicant</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-center">Date Applied</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-center">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline">
                                {applicants.map((applicant) => (
                                    <tr key={applicant.id} className={`group hover:bg-surface-container-high transition-colors ${selectedApplicants.includes(applicant.id) ? 'bg-primary/5' : ''}`}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedApplicants.includes(applicant.id)}
                                                    onChange={() => toggleSelectApplicant(applicant.id)}
                                                    className="w-4 h-4 rounded appearance-none bg-surface border border-outline checked:bg-primary checked:border-primary flex items-center justify-center transition-all cursor-pointer shadow-sm relative before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMCA2IDkgMTcgNCAxMiI+PC9wb2x5bGluZT48L3N2Zz4=')] before:bg-[length:10px] before:bg-center before:bg-no-repeat before:opacity-0 checked:before:opacity-100"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-surface border border-outline flex items-center justify-center font-black text-on-surface text-lg uppercase overflow-hidden shrink-0 shadow-sm italic">
                                                    {applicant.profile_picture ? (
                                                        <img src={`http://localhost:5000${applicant.profile_picture}`} alt={applicant.applicant_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        applicant.applicant_name?.charAt(0)
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-black text-on-surface uppercase tracking-tight italic truncate group-hover:text-primary transition-colors">{applicant.applicant_name}</h3>
                                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] truncate opacity-70 mt-1">{applicant.applicant_email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-[10px] font-mono font-black text-on-surface-variant/70 uppercase">
                                                {new Date(applicant.applied_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center">
                                                <StatusBadge status={applicant.status} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-100">
                                                <button
                                                    onClick={() => navigate(`/employer/applicant/${applicant.id}`)}
                                                    className="px-5 py-2.5 bg-surface border border-outline rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-on-surface hover:border-primary/50 hover:text-primary hover:bg-surface-container-high transition-all shadow-sm"
                                                >
                                                    View Profile
                                                </button>

                                                {applicant.status === "pending" && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(applicant.id, "shortlisted")}
                                                            className="w-10 h-10 rounded-xl bg-surface border border-outline text-on-surface-variant flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-500 transition-all shadow-sm"
                                                            title="Shortlist"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">grade</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(applicant.id, "rejected")}
                                                            className="w-10 h-10 rounded-xl bg-surface border border-outline text-on-surface-variant flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all shadow-sm"
                                                            title="Reject"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
