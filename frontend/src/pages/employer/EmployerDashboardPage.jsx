import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import axios from "axios";
import StatusBadge from "../../components/applications/StatusBadge";

export default function EmployerDashboardPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [topJobs, setTopJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/dashboard/employer",
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setStats(response.data.stats);
      setTopJobs(response.data.topJobs);
      setRecentApplicants(response.data.recentApplicants);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-6 text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-primary animate-pulse italic">Loading recruitment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="bg-surface-container p-12 rounded-card border border-red-500/20 max-w-md space-y-6 shadow-2xl">
              <span className="material-symbols-outlined text-red-500 text-6xl">error</span>
              <h2 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter">Connection Error</h2>
              <p className="text-on-surface-variant uppercase text-[10px] font-bold tracking-[0.2em] leading-relaxed">{error}</p>
              <button 
                  onClick={fetchDashboardData} 
                  className="px-8 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-on-primary transition-all active:scale-95 italic"
              >
                  Retry Connection
              </button>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-12 border-b border-outline">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
              Welcome back, <span className="text-primary">{user?.name}</span>! 👋
            </h1>
            <p className="text-on-surface-variant font-medium text-sm lg:text-base opacity-70">Elevating your recruitment workflow with direct connections.</p>
          </div>
          <button
            onClick={() => navigate("/employer/create-job")}
            className="px-8 py-4 bg-primary text-on-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Post New Job
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Total Jobs", value: stats.totalJobs, sub: `${stats.activeJobs} active`, icon: "work", color: "text-blue-500" },
            { label: "Applications", value: stats.totalApplications, sub: `${stats.recentApplications} new`, icon: "inbox_customize", color: "text-indigo-500" },
            { label: "Pending", value: stats.pendingApplications, sub: "Needs attention", icon: "pending_actions", color: "text-amber-500" },
            { label: "Accepted", value: stats.acceptedApplications, sub: "Hired talent", icon: "verified", color: "text-emerald-500" }
          ].map((stat, i) => (
            <div 
                key={i} 
                className="bg-surface-container p-10 rounded-card border border-outline flex flex-col justify-between group hover:border-primary/30 transition-all hover:-translate-y-2 shadow-sm hover:shadow-xl cursor-pointer"
                onClick={() => navigate("/employer/my-jobs")}
            >
              <div className="flex justify-between items-start mb-8">
                <span className={`material-symbols-outlined text-5xl ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity italic`}>{stat.icon}</span>
                <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors">north_east</span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">{stat.label}</p>
                <h3 className="text-5xl font-black text-on-surface italic tracking-tighter">{stat.value}</h3>
                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 italic">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Top Jobs */}
          <section className="lg:col-span-7 bg-surface-container flex flex-col rounded-card border border-outline overflow-hidden shadow-sm">
            <div className="p-8 border-b border-outline flex justify-between items-center">
              <h2 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">trending_up</span> Top Jobs
              </h2>
              <button onClick={() => navigate("/employer/my-jobs")} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                View All
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 flex-1">
              {topJobs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-on-surface-variant/40">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] italic mb-6">No jobs posted yet</p>
                  <button onClick={() => navigate("/employer/create-job")} className="px-6 py-3 bg-surface border border-outline text-on-surface hover:text-primary hover:border-primary/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Post Your First Job
                  </button>
                </div>
              ) : (
                topJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-6 bg-surface border border-outline rounded-2xl hover:border-primary/40 hover:bg-surface-container-high transition-all cursor-pointer flex justify-between items-center group shadow-sm"
                    onClick={() => navigate(`/employer/job/${job.id}/applicants`)}
                  >
                    <div>
                      <h4 className="font-bold mb-1 text-on-surface group-hover:text-primary transition-colors italic">{job.title}</h4>
                      <p className="text-xs text-on-surface-variant font-medium">
                        {job.location} • <span className="text-primary/70">{job.job_type}</span>
                      </p>
                    </div>
                    <div className="text-center bg-primary/10 px-6 py-3 rounded-xl border border-primary/20">
                      <div className="text-2xl font-black text-primary leading-none">{job.application_count}</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Apps</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Right: Recent Applicants */}
          <section className="lg:col-span-5 bg-surface-container flex flex-col rounded-card border border-outline overflow-hidden shadow-sm">
            <div className="p-8 border-b border-outline flex justify-between items-center">
              <h2 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">group</span> Recent Talent
              </h2>
              <button onClick={() => navigate("/employer/my-jobs")} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                Manage
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar">
              {recentApplicants.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-12 text-center text-on-surface-variant/40">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">No applications yet</p>
                </div>
              ) : (
                recentApplicants.map((applicant) => (
                  <div
                    key={applicant.application_id}
                    className="p-5 bg-surface border border-outline rounded-2xl hover:border-primary/40 hover:bg-surface-container-high transition-all cursor-pointer flex items-center gap-5 shadow-sm group"
                    onClick={() => navigate(`/employer/applicant/${applicant.application_id}`)}
                  >
                    <div className="w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-xl overflow-hidden shrink-0 shadow-sm border-outline">
                      {applicant.profile_picture ? (
                        <img
                          src={`http://localhost:5000${applicant.profile_picture}`}
                          className="w-full h-full object-cover"
                          alt={applicant.applicant_name}
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-container-high text-on-surface flex items-center justify-center italic">
                          {applicant.applicant_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors italic">{applicant.applicant_name}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant truncate opacity-70 mt-1">{applicant.job_title}</p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={applicant.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <section className="bg-primary/[0.03] p-12 rounded-card border border-primary/20 space-y-10 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[200px] text-primary italic">bolt</span>
            </div>
            <div className="flex items-center gap-4 relative z-10">
                <span className="w-12 h-1 bg-primary rounded-full"></span>
                <h3 className="text-base font-black text-primary uppercase tracking-[0.3em] italic">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 text-on-surface">
              {[
                { label: "Post Job", icon: "add_task", link: "/employer/create-job" },
                { label: "Manage Jobs", icon: "assignment", link: "/employer/my-jobs" },
                { label: "Analytics", icon: "insights", link: "/employer/analytics" },
                { label: "Settings", icon: "tune", link: "/settings" }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.link)}
                  className="p-6 bg-surface border border-outline rounded-2xl flex flex-col items-center gap-5 hover:border-primary/50 hover:bg-surface-container-high transition-all shadow-sm group hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm italic">
                    <span className="material-symbols-outlined text-3xl">{action.icon}</span>
                  </div>
                  <span className="text-[11px] font-black tracking-widest uppercase text-on-surface group-hover:text-primary italic">{action.label}</span>
                </button>
              ))}
            </div>
        </section>
      </div>
    </div>
  );
}
