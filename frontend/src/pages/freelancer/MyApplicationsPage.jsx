// src/pages/freelancer/MyApplicationsPage.jsx
import { useState, useEffect } from 'react';
import { fetchMyApplications, withdrawApplication } from '../../api/applications';
import StatusBadge from '../../components/applications/StatusBadge';
import FreelancerTopbar from '../../components/freelancer/FreelancerTopbar';

const FILTER_OPTIONS = ['all', 'pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];

const FILTER_CONFIG = {
    all:         { activeClass: 'bg-on-surface/10 text-on-surface border-on-surface/20', dot: 'bg-on-surface/40' },
    pending:     { activeClass: 'bg-amber-500/15 text-amber-600 border-amber-500/20', dot: 'bg-amber-500' },
    shortlisted: { activeClass: 'bg-blue-500/15 text-blue-600 border-blue-500/20', dot: 'bg-blue-500' },
    accepted:    { activeClass: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
    rejected:    { activeClass: 'bg-red-500/15 text-red-600 border-red-500/20', dot: 'bg-red-500' },
    withdrawn:   { activeClass: 'bg-slate-500/15 text-slate-600 border-slate-500/20', dot: 'bg-slate-500' },
};

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [activeFilter, setActiveFilter] = useState('all');
    const [withdrawingId, setWithdrawingId] = useState(null);
    const [confirmWithdraw, setConfirmWithdraw] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        fetchMyApplications()
            .then((data) => {
                setApplications(data.applications);
                setFiltered(data.applications);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setFiltered(activeFilter === 'all'
            ? applications
            : applications.filter((a) => a.status === activeFilter));
    }, [activeFilter, applications]);

    const handleWithdraw = async (application) => {
        setWithdrawingId(application.id);
        try {
            await withdrawApplication(application.id);
            setApplications((prev) => prev.map((a) => a.id === application.id ? { ...a, status: 'withdrawn' } : a));
            setConfirmWithdraw(null);
            showToast('Application withdrawn.');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setWithdrawingId(null);
        }
    };

    const counts = FILTER_OPTIONS.reduce((acc, f) => {
        acc[f] = f === 'all' ? applications.length : applications.filter((a) => a.status === f).length;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-6">
            {/* Toast */}
            {toast.msg && (
                <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded-xl shadow-2xl font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
                </div>
            )}

            {/* Withdraw Modal */}
            {confirmWithdraw && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setConfirmWithdraw(null)} />
                    <div className="relative w-full max-w-md bg-surface-container border border-outline rounded-card p-10 shadow-3xl space-y-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                                <span className="material-symbols-outlined text-4xl">warning</span>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-on-surface uppercase italic tracking-tighter">Withdraw?</h2>
                                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Action cannot be reversed</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest leading-relaxed">
                                You are withdrawing your application for:
                            </p>
                            <div className="p-6 rounded-xl bg-surface border border-outline">
                                <p className="text-lg font-black text-primary uppercase italic tracking-tight italic">"{confirmWithdraw.job_title}"</p>
                            </div>
                            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                ⚠ You won't be able to re-apply to this job after withdrawing.
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setConfirmWithdraw(null)} 
                                className="flex-1 py-4 px-6 rounded-xl border border-outline text-on-surface-variant text-[10px] font-black uppercase tracking-widest hover:bg-on-surface/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleWithdraw(confirmWithdraw)}
                                disabled={withdrawingId === confirmWithdraw.id}
                                className="flex-1 py-4 px-6 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {withdrawingId === confirmWithdraw.id ? 'Withdrawing…' : 'Withdraw Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-12">
                <header className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
                        My <span className="text-primary">Applications</span>
                    </h1>
                    <p className="text-on-surface-variant font-medium">Track all your active and past job applications in one place.</p>
                </header>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in fade-in">
                        {error}
                    </div>
                )}

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-3 pb-4 overflow-x-auto no-scrollbar">
                    {FILTER_OPTIONS.map((f) => {
                        const active = activeFilter === f;
                        const config = FILTER_CONFIG[f] || FILTER_CONFIG.all;
                        return (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap
                                    ${active 
                                        ? config.activeClass 
                                        : 'bg-surface-container border-outline text-on-surface-variant hover:border-primary/20'}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${active ? config.dot : 'bg-on-surface-variant/20'}`} />
                                {f}
                                {counts[f] > 0 && (
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black ${active ? 'bg-white/20' : 'bg-on-surface/10'}`}>
                                        {counts[f]}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-surface-container/50 border border-outline rounded-card p-10 animate-pulse space-y-4">
                                <div className="h-6 w-1/3 bg-on-surface/10 rounded-lg" />
                                <div className="h-3 w-1/4 bg-on-surface/5 rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-surface-container p-20 rounded-card border border-outline border-dashed flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 rounded-full bg-surface border border-outline flex items-center justify-center text-on-surface-variant italic font-black text-4xl">
                            ?
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-on-surface uppercase italic tracking-tight">No results found</h3>
                            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                                {activeFilter === 'all'
                                    ? "You haven't applied to any jobs yet."
                                    : `No ${activeFilter} applications found.`}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filtered.map((app) => (
                            <div key={app.id} className="group relative bg-surface-container p-8 rounded-card border border-outline hover:border-primary/20 transition-all duration-300">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                                    <div className="space-y-6 flex-1 min-w-0">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <h2 className="text-xl font-black text-on-surface tracking-tighter uppercase italic group-hover:text-primary transition-colors">
                                                    {app.job_title}
                                                </h2>
                                                <StatusBadge status={app.status} />
                                            </div>
                                            <p className="text-sm font-black text-primary uppercase tracking-widest italic">{app.employer_name}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { icon: 'location_on', text: app.job_location },
                                                { icon: 'schedule', text: app.job_type },
                                                { icon: 'category', text: app.category_name }
                                            ].filter(chip => chip.text).map((chip, idx) => (
                                                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-outline text-[9px] font-black text-on-surface-variant uppercase tracking-widest">
                                                    <span className="material-symbols-outlined text-[14px]">{chip.icon}</span>
                                                    {chip.text}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-8 pt-2">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Portfolio / CV</p>
                                                <p className="text-[10px] font-black text-on-surface uppercase tracking-widest italic">{app.cv_title || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Submission Date</p>
                                                <p className="text-[10px] font-black text-on-surface uppercase tracking-widest italic">
                                                    {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        {app.cover_letter && (
                                            <details className="group/details">
                                                <summary className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity list-none">
                                                    <span className="material-symbols-outlined text-sm group-open/details:rotate-180 transition-transform">expand_more</span>
                                                    View Statement of Purpose
                                                </summary>
                                                <div className="mt-4 p-6 rounded-xl bg-surface border border-outline italic text-on-surface-variant text-sm leading-relaxed">
                                                    "{app.cover_letter}"
                                                </div>
                                            </details>
                                        )}
                                    </div>

                                    <div className="flex md:flex-col items-center justify-end gap-4 min-w-[120px]">
                                        {app.status === 'pending' && (
                                            <button
                                                onClick={() => setConfirmWithdraw(app)}
                                                className="px-6 py-3 rounded-xl border border-red-500/30 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all w-full text-center"
                                            >
                                                Withdraw
                                            </button>
                                        )}
                                        {app.status === 'accepted' && (
                                            <div className="flex flex-col items-center gap-1 animate-bounce">
                                                <span className="text-3xl">🎯</span>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest shadow-emerald-500/20">Accepted</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
