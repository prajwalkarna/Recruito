import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function FreelancerAnalyticsPage() {
  const { token } = useAuth();

  const [stats, setStats] = useState(null);
  const [applicationsOverTime, setApplicationsOverTime] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, overTimeRes, statusRes, activityRes] = await Promise.all([
        axios.get("http://localhost:5000/api/analytics/freelancer/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(
          `http://localhost:5000/api/analytics/freelancer/applications-over-time?days=${timeRange}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        axios.get(
          "http://localhost:5000/api/analytics/freelancer/status-distribution",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        axios.get(
          "http://localhost:5000/api/analytics/freelancer/recent-activity",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      ]);

      setStats(statsRes.data.stats);
      setApplicationsOverTime(overTimeRes.data.data);
      setStatusDistribution(statusRes.data.distribution);
      setRecentActivity(activityRes.data.activities);
    } catch (err) {
      console.error("Fetch analytics error:", err);
      setError(
        err.response?.data?.message || err.response?.data?.error || err.message,
      );
    } finally {
      setLoading(false);
    }
  }, [token, timeRange]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const COLORS = {
    pending: "#eab308", // amber-500
    accepted: "#10b981", // emerald-500
    rejected: "#ef4444", // red-500
    shortlisted: "#6366f1", // indigo-500
    withdrawn: "#94a3b8", // slate-400
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-6 text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-primary animate-pulse italic">Loading performance metrics...</p>
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
              <button onClick={fetchAllData} className="px-8 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-on-primary transition-all active:scale-95 italic">
                  Retry Synchronization
              </button>
          </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-outline">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
                    Career <span className="text-primary">Performance</span>
                </h1>
                <p className="text-on-surface-variant font-medium text-sm lg:text-base opacity-70">A detailed overview of your professional application reach and success metrics.</p>
            </div>
            
            <div className="flex bg-surface-container border border-outline p-1.5 rounded-2xl shadow-sm">
                {[7, 30, 90].map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic ${
                            timeRange === range ? 'bg-primary text-on-primary shadow-xl shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        {range} Days
                    </button>
                ))}
            </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
                { label: 'Total Applications', value: stats?.applications?.total_applications ?? 0, detail: `${stats?.monthly_applications ?? 0} this month`, icon: 'send', color: 'text-primary' },
                { label: 'Success Rate', value: `${stats?.success_rate ?? 0}%`, detail: 'Average Acceptance Rate', icon: 'trending_up', color: 'text-emerald-500' },
                { label: 'Active Applications', value: stats?.applications?.pending ?? 0, detail: 'Awaiting Response', icon: 'hourglass_top', color: 'text-amber-500' },
                { label: 'Avg Response Time', value: `${stats?.avg_response_days ?? "N/A"}D`, detail: 'Days to Host Response', icon: 'schedule', color: 'text-indigo-500' }
            ].map((stat, idx) => (
                <div key={idx} className="bg-surface-container p-10 rounded-card border border-outline flex flex-col justify-between group hover:border-primary/30 transition-all hover:-translate-y-2 shadow-sm hover:shadow-xl">
                    <div className="flex justify-between items-start mb-8">
                        <span className={`material-symbols-outlined text-5xl ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity italic`}>{stat.icon}</span>
                        <div className="w-8 h-1 bg-outline rounded-full group-hover:bg-primary/30 transition-colors mt-4"></div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">{stat.label}</p>
                        <h3 className="text-5xl font-black text-on-surface italic tracking-tighter">{stat.value}</h3>
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 italic">{stat.detail}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Activity Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="bg-surface-container p-12 rounded-card border border-outline space-y-10 min-h-[500px] flex flex-col shadow-sm">
                <div className="flex items-center justify-between border-b border-outline pb-6">
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">timeline</span> Activity Trends
                    </h3>
                </div>
                <div className="flex-1 min-h-0 pt-4">
                    {applicationsOverTime.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={applicationsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" vertical={false} opacity={0.3} />
                                <XAxis dataKey="date" tickFormatter={formatDate} stroke="currentColor" className="text-on-surface-variant/40" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} dy={15} />
                                <YAxis stroke="currentColor" className="text-on-surface-variant/40" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)', borderRadius: '16px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', color: 'var(--color-on-surface)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ color: '#6366f1', marginBottom: '8px' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} dot={{ fill: '#6366f1', r: 5, strokeWidth: 2, stroke: 'var(--color-background)' }} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={1500} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center italic text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em]">No application data for this period.</div>
                    )}
                </div>
            </section>

            <section className="bg-surface-container p-12 rounded-card border border-outline space-y-10 min-h-[500px] flex flex-col shadow-sm">
                <div className="flex items-center justify-between border-b border-outline pb-6">
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">pie_chart</span> Application Status
                    </h3>
                </div>
                <div className="flex-1 min-h-0 pt-4">
                    {statusDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={10}
                                >
                                    {statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.status] || "#718096"} stroke="var(--color-surface)" strokeWidth={4} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)', borderRadius: '16px', color: 'var(--color-on-surface)' }} />
                                <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center italic text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em] text-center">No status data recorded.</div>
                    )}
                </div>
            </section>
        </div>

        {/* Lower Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="bg-surface-container p-12 rounded-card border border-outline space-y-10 min-h-[500px] flex flex-col shadow-sm">
                <div className="flex items-center justify-between border-b border-outline pb-6">
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">bar_chart</span> Status Performance
                    </h3>
                </div>
                <div className="flex-1 min-h-0 pt-4">
                    {statusDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusDistribution} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" vertical={false} opacity={0.3} />
                                <XAxis dataKey="status" stroke="currentColor" className="text-on-surface-variant/40" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} dy={15} tickFormatter={(val) => val.toUpperCase()} />
                                <YAxis stroke="currentColor" className="text-on-surface-variant/40" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip 
                                    cursor={{ fill: 'var(--color-on-surface)', opacity: 0.05 }}
                                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-outline)', borderRadius: '16px' }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={45}>
                                    {statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.status] || "#718096"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center italic text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em] text-center">No performance data available.</div>
                    )}
                </div>
            </section>

            <section className="bg-surface-container p-12 rounded-card border border-outline space-y-10 min-h-[500px] flex flex-col overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-outline pb-6">
                    <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">history</span> Recent Activity
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto pr-4 space-y-5 custom-scrollbar">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                            <div key={activity.id} className="flex gap-6 p-6 bg-surface border border-outline rounded-2xl hover:bg-surface-container-high transition-all group relative overflow-hidden shadow-sm">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg ${
                                    activity.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500' : 
                                    activity.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                                    activity.status === 'shortlisted' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                   {activity.status === "pending" && <span className="material-symbols-outlined">hourglass_empty</span>}
                                   {activity.status === "accepted" && <span className="material-symbols-outlined">check_circle</span>}
                                   {activity.status === "rejected" && <span className="material-symbols-outlined">cancel</span>}
                                   {activity.status === "shortlisted" && <span className="material-symbols-outlined">star</span>}
                                </div>
                                <div className="space-y-2 min-w-0">
                                    <p className="text-sm font-black text-on-surface uppercase italic leading-tight truncate">
                                        Applied to <span className="text-primary group-hover:underline">{activity.job_title}</span>
                                    </p>
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest truncate opacity-70">at {activity.employer_name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[10px] text-on-surface-variant/40">schedule</span>
                                        <p className="text-[9px] font-black font-mono text-on-surface-variant/40 uppercase">{timeAgo(activity.applied_at)}</p>
                                    </div>
                                </div>
                                <div className={`absolute top-6 right-6 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border italic ${
                                    activity.status === 'accepted' ? 'bg-emerald-500 text-on-primary border-emerald-500/20' : 
                                    activity.status === 'rejected' ? 'bg-red-500 text-on-primary border-red-500/20' : 
                                    'bg-surface-container-high text-on-surface border-outline'
                                }`}>
                                    {activity.status}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center italic text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em] text-center">No recent activity detected.</div>
                    )}
                </div>
            </section>
        </div>

        {/* Pro Insights */}
        {stats?.success_rate < 30 && stats?.applications?.total_applications >= 3 && (
            <section className="bg-primary/[0.03] p-12 rounded-card border border-primary/20 space-y-10 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[200px] text-primary italic">lightbulb</span>
                </div>
                <div className="flex items-center gap-4 relative z-10 transition-transform hover:translate-x-1">
                    <span className="w-12 h-1 bg-primary rounded-full"></span>
                    <h3 className="text-base font-black text-primary uppercase tracking-[0.3em] italic">Optimization Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 text-on-surface">
                    {[
                        { title: 'Personalized Applications', detail: 'TAILOR YOUR STATEMENT OF PURPOSE FOR EACH ROLE.', icon: 'edit_note' },
                        { title: 'Portfolio Updates', detail: 'ENSURE YOUR CASE STUDIES ARE UP-TO-DATE.', icon: 'auto_fix_high' },
                        { title: 'Fast Response', detail: 'RESPOND TO CLIENT MESSAGES WITHIN 2 HOURS.', icon: 'speed' }
                    ].map((tip, idx) => (
                        <div key={idx} className="flex gap-6 p-6 bg-surface border border-outline rounded-2xl shadow-sm hover:shadow-lg transition-all group">
                            <span className="material-symbols-outlined text-primary/40 text-3xl group-hover:text-primary transition-colors italic">{tip.icon}</span>
                            <div className="space-y-2">
                                <p className="text-[11px] font-black text-on-surface uppercase italic tracking-tight">{tip.title}</p>
                                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest leading-relaxed opacity-70">{tip.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}
      </div>
    </div>
  );
}
