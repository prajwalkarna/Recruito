// src/components/applications/StatusBadge.jsx
const STATUS_CONFIG = {
    pending:     { label: 'Pending',     classes: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
    shortlisted: { label: 'Shortlisted', classes: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20', dot: 'bg-blue-500' },
    accepted:    { label: 'Accepted',    classes: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
    rejected:    { label: 'Rejected',    classes: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20', dot: 'bg-red-500' },
    withdrawn:   { label: 'Withdrawn',   classes: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-500' },
};

export default function StatusBadge({ status }) {
    const s = status?.toLowerCase() || 'pending';
    const c = STATUS_CONFIG[s] || STATUS_CONFIG.pending;
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${c.classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shadow-[0_0_8px_currentColor]`} />
            {c.label}
        </span>
    );
}
