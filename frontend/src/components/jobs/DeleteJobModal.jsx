// src/components/jobs/DeleteJobModal.jsx
export default function DeleteJobModal({ jobTitle, onConfirm, onCancel, loading = false }) {
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Icon + Title */}
                <div style={styles.header}>
                    <div style={styles.iconWrap}>
                        <svg width="22" height="22" fill="none" stroke="#f87171" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h2 style={styles.title}>Delete Job Listing</h2>
                </div>

                {/* Body */}
                <p style={styles.body}>Are you sure you want to delete:</p>
                <p style={styles.jobTitle}>"{jobTitle}"</p>
                <p style={styles.warning}>
                    ⚠ This action cannot be undone. All applications for this job will also be deleted.
                </p>

                {/* Actions */}
                <div style={styles.btnRow}>
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        style={styles.cancelBtn}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        style={{ ...styles.deleteBtn, opacity: loading ? 0.6 : 1 }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#dc2626'; }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#ef4444'; }}
                    >
                        {loading ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        padding: 16,
    },
    modal: {
        background: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: '28px 28px 24px',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    iconWrap: {
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 10,
        padding: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    title: {
        fontSize: 17,
        fontWeight: 700,
        color: '#f3f4f6',
        margin: 0,
    },
    body: {
        fontSize: 14,
        color: '#9ca3af',
        margin: '0 0 6px',
    },
    jobTitle: {
        fontSize: 14,
        fontWeight: 600,
        color: '#e5e7eb',
        margin: '0 0 16px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    warning: {
        fontSize: 13,
        color: '#fbbf24',
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 24,
    },
    btnRow: {
        display: 'flex',
        gap: 10,
    },
    cancelBtn: {
        flex: 1,
        padding: '10px 0',
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 10,
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    deleteBtn: {
        flex: 1,
        padding: '10px 0',
        background: '#ef4444',
        border: 'none',
        borderRadius: 10,
        color: '#fff',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
};
