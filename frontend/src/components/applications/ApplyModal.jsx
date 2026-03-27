// src/components/applications/ApplyModal.jsx
// Shown when a freelancer clicks "Apply" on a job card.
// Props:
//   job       — { id, title, employer_name }
//   onClose   — close the modal
//   onSuccess — called after successful application

import { useState, useEffect } from 'react';
import { fetchMyCVs } from '../../api/cvs';
import { applyToJob } from '../../api/applications';

export default function ApplyModal({ job, onClose, onSuccess }) {
    const [cvs, setCVs] = useState([]);
    const [selectedCV, setSelectedCV] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [loading, setLoading] = useState(false);
    const [cvLoading, setCVLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyCVs()
            .then((data) => {
                setCVs(data.cvs);
                const def = data.cvs.find((cv) => cv.is_default);
                if (def) setSelectedCV(String(def.id));
            })
            .catch(() => setError('Failed to load your CVs.'))
            .finally(() => setCVLoading(false));
    }, []);

    const handleSubmit = async () => {
        if (!selectedCV) {
            setError('Please select a CV to apply with.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await applyToJob({
                job_id: job.id,
                cv_id: Number(selectedCV),
                cover_letter: coverLetter.trim() || null,
            });
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={s.overlay} onClick={onClose}>
            <div style={s.modal} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={s.header}>
                    <div>
                        <h2 style={s.title}>Apply for Position</h2>
                        <p style={s.subtitle}>{job.title}{job.employer_name ? ` · ${job.employer_name}` : ''}</p>
                    </div>
                    <button onClick={onClose} style={s.closeBtn}>×</button>
                </div>

                {/* Body */}
                <div style={s.body}>

                    {/* CV Selector */}
                    <div style={s.field}>
                        <label style={s.label}>
                            Select CV <span style={{ color: '#f87171' }}>*</span>
                        </label>
                        {cvLoading ? (
                            <div style={s.placeholder}>Loading your CVs...</div>
                        ) : cvs.length === 0 ? (
                            <div style={s.warningBox}>
                                You have no saved CVs. Please{' '}
                                <a href="/freelancer/create-cv" style={s.link} onClick={onClose}>
                                    build a CV
                                </a>{' '}
                                first before applying.
                            </div>
                        ) : (
                            <select
                                value={selectedCV}
                                onChange={(e) => setSelectedCV(e.target.value)}
                                style={s.select}
                            >
                                <option value="">— Choose a CV —</option>
                                {cvs.map((cv) => (
                                    <option key={cv.id} value={cv.id}>
                                        {cv.title || 'Untitled CV'} — {cv.full_name}
                                        {cv.is_default ? ' ⭐' : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Cover Letter */}
                    <div style={s.field}>
                        <label style={s.label}>
                            Cover Letter <span style={s.optional}>(optional)</span>
                        </label>
                        <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={5}
                            placeholder="Introduce yourself and explain why you're a great fit..."
                            style={s.textarea}
                            maxLength={2000}
                        />
                        <p style={s.charCount}>{coverLetter.length} / 2000</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={s.errorBox}>{error}</div>
                    )}
                </div>

                {/* Footer */}
                <div style={s.footer}>
                    <button onClick={onClose} disabled={loading} style={s.cancelBtn}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || cvs.length === 0}
                        style={{
                            ...s.submitBtn,
                            opacity: (loading || cvs.length === 0) ? 0.6 : 1,
                            cursor: (loading || cvs.length === 0) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const s = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        padding: 16,
    },
    modal: {
        background: 'rgba(20, 20, 35, 0.98)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        width: '100%', maxWidth: 500,
        boxShadow: '0 30px 70px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '24px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
    },
    title: { margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' },
    subtitle: { margin: '4px 0 0', fontSize: '0.875rem', color: '#94a3b8' },
    closeBtn: {
        background: 'transparent', border: 'none',
        color: '#94a3b8', fontSize: '1.8rem', lineHeight: 1,
        cursor: 'pointer', padding: 0, marginLeft: 8,
        transition: 'color 0.2s',
    },
    body: { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 },
    field: { display: 'flex', flexDirection: 'column', gap: 8 },
    label: { fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1' },
    optional: { color: '#64748b', fontWeight: 400 },
    select: {
        width: '100%', padding: '12px 16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, color: '#f1f5f9',
        fontSize: '0.95rem', cursor: 'pointer',
        outline: 'none',
    },
    textarea: {
        width: '100%', padding: '12px 16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, color: '#f1f5f9',
        fontSize: '0.9rem', resize: 'none',
        fontFamily: 'inherit', outline: 'none',
        boxSizing: 'border-box',
    },
    charCount: { margin: 0, fontSize: '0.75rem', color: '#64748b', textAlign: 'right' },
    placeholder: {
        padding: '12px 16px',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, color: '#64748b', fontSize: '0.9rem',
    },
    warningBox: {
        padding: '12px 16px',
        background: 'rgba(249,115,22,0.08)',
        border: '1px solid rgba(249,115,22,0.25)',
        borderRadius: 12, color: '#fb923c', fontSize: '0.9rem',
    },
    link: { color: '#6366f1', fontWeight: 600 },
    errorBox: {
        padding: '12px 16px',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 12, color: '#f87171', fontSize: '0.9rem',
    },
    footer: {
        display: 'flex', gap: 12, padding: '20px 28px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.01)',
    },
    cancelBtn: {
        flex: 1, padding: '12px 0',
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12, color: '#94a3b8',
        fontSize: '0.95rem', fontWeight: 600,
        cursor: 'pointer',
    },
    submitBtn: {
        flex: 1, padding: '12px 0',
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        border: 'none', borderRadius: 12, color: '#fff',
        fontSize: '0.95rem', fontWeight: 700,
        boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
    },
};
