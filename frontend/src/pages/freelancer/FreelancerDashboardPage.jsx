import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import axios from "axios";
import StatusBadge from "../../components/applications/StatusBadge";

export default function FreelancerDashboardPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/dashboard/freelancer",
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setStats(response.data.stats);
      setRecentApplications(response.data.recentApplications);
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
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-primary animate-pulse italic">Loading performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="bg-surface-container p-12 rounded-card border border-red-500/20 max-w-md space-y-6 shadow-2xl">
              <span className="material-symbols-outlined text-red-500 text-6xl">cloud_off</span>
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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-12 border-b border-outline">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
              Welcome back, <span className="text-primary">{user?.name}</span>! 👋
            </h1>
            <p className="text-on-surface-variant font-medium text-sm lg:text-base opacity-70">
              You have <span className="text-primary font-bold">{(stats?.pendingApplications || 0)}</span> applications pending review.
            </p>
          </div>
          <button 
            onClick={() => navigate("/jobs")} 
            className="px-8 py-4 bg-primary text-on-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">travel_explore</span>
            Find Work
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Applied Jobs", value: stats?.totalApplications || 0, icon: "work_history", color: "text-blue-500", nav: "/freelancer/my-applications" },
            { label: "In Review", value: stats?.pendingApplications || 0, icon: "hourglass_top", color: "text-amber-500", nav: "/freelancer/my-applications" },
            { label: "Offers", value: stats?.acceptedApplications || 0, icon: "auto_awesome", color: "text-emerald-500", nav: "/freelancer/my-applications" },
            { label: "Resumes", value: stats?.totalCVs || 0, icon: "folder_shared", color: "text-purple-500", nav: "/freelancer/my-cvs" }
          ].map((stat, i) => (
            <div 
              key={i} 
              className="bg-surface-container p-10 rounded-card border border-outline flex flex-col justify-between group hover:border-primary/30 transition-all hover:-translate-y-2 shadow-sm hover:shadow-xl cursor-pointer"
              onClick={() => navigate(stat.nav)}
            >
              <div className="flex justify-between items-start mb-8">
                <span className={`material-symbols-outlined text-5xl ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity italic`}>{stat.icon}</span>
                <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors">north_east</span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">{stat.label}</p>
                <h3 className="text-5xl font-black text-on-surface italic tracking-tighter">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Profile Strength */}
          <section className="lg:col-span-5 bg-surface-container rounded-card border border-outline p-12 relative overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">analytics</span> Profile Score
              </h2>
              <span className="bg-primary/5 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20">
                {stats?.profileCompletion || 0}% Complete
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-10">
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="64" fill="none" stroke="currentColor" className="text-outline" strokeWidth="10" />
                  <circle
                    cx="72" cy="72" r="64" fill="none"
                    stroke="currentColor"
                    className="text-primary transition-all duration-1000"
                    strokeWidth="10"
                    strokeDasharray={402}
                    strokeDashoffset={402 - (402 * (stats?.profileCompletion || 0)) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-on-surface leading-none">{stats?.profileCompletion || 0}%</span>
                </div>
              </div>

              <div className="flex-1 space-y-6 w-full">
                <div className="space-y-3">
                  {[
                    { label: "Contact Details", complete: stats?.profileCompletion >= 20 },
                    { label: "Identity Verified", complete: stats?.profileCompletion >= 40 },
                    { label: "Expert Bio", complete: stats?.profileCompletion >= 80 }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${item.complete ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface border-outline text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[14px]">{item.complete ? 'check' : 'close'}</span>
                      </div>
                      <span className={`text-xs font-bold tracking-wide ${item.complete ? 'text-on-surface' : 'text-on-surface-variant/60'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>

                {stats?.profileCompletion < 100 && (
                  <button onClick={() => navigate("/profile/edit")} className="w-full py-4 bg-surface border border-outline rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-on-surface hover:text-primary hover:border-primary/30 hover:bg-surface-container-high transition-all shadow-sm">
                    Enhance Profile
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="lg:col-span-7 bg-surface-container flex flex-col rounded-card border border-outline overflow-hidden shadow-sm">
            <div className="p-8 border-b border-outline flex justify-between items-center">
              <h2 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">history</span> Recent Applications
              </h2>
              <button onClick={() => navigate("/freelancer/my-applications")} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                View All
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 flex-1">
              {recentApplications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-on-surface-variant/40">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] italic mb-6">No recent applications.</p>
                  <button onClick={() => navigate("/jobs")} className="px-6 py-3 bg-surface border border-outline text-on-surface hover:text-primary hover:border-primary/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                    Find New Opportunities
                  </button>
                </div>
              ) : (
                recentApplications.slice(0, 4).map((app) => (
                  <div 
                    key={app.id} 
                    className="p-5 bg-surface border border-outline rounded-2xl hover:border-primary/40 hover:bg-surface-container-high transition-all cursor-pointer flex justify-between items-center group shadow-sm"
                    onClick={() => navigate(`/freelancer/my-applications`)}
                  >
                    <div className="overflow-hidden min-w-0 pr-4">
                      <h4 className="font-bold text-sm text-on-surface mb-1 group-hover:text-primary transition-colors truncate italic">{app.title}</h4>
                      <p className="text-[11px] text-on-surface-variant font-medium truncate">
                        <span className="opacity-80">{app.employer_name}</span> • {app.job_type}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                )))}
              </div>
          </section>
        </div>

        {/* Quick Access */}
        <section className="bg-primary/[0.03] p-12 rounded-card border border-primary/20 space-y-10 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[200px] text-primary italic">bolt</span>
          </div>
          <div className="flex items-center gap-4 relative z-10">
              <span className="w-12 h-1 bg-primary rounded-full"></span>
              <h3 className="text-base font-black text-primary uppercase tracking-[0.3em] italic">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 relative z-10 text-on-surface">
            {[
              { label: "Find Jobs", icon: "search", link: "/jobs" },
              { label: "Documents", icon: "article", link: "/freelancer/my-cvs" },
              { label: "Messages", icon: "chat_bubble", link: "/messages" },
              { label: "Saved Jobs", icon: "bookmark", link: "/freelancer/saved-jobs" },
              { label: "Analytics", icon: "insights", link: "/freelancer/analytics" },
              { label: "Settings", icon: "settings_suggest", link: "/settings" }
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.link)}
                className="p-6 bg-surface border border-outline rounded-2xl flex flex-col items-center gap-5 hover:border-primary/50 hover:bg-surface-container-high transition-all shadow-sm group hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm italic">
                  <span className="material-symbols-outlined text-3xl">{action.icon}</span>
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant group-hover:text-primary group-hover:opacity-100 opacity-80 italic">{action.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
