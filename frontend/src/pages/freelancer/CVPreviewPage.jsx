// src/pages/freelancer/CVPreviewPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CVPreview from '../../components/cv/CVPreview';
import { fetchCVById } from '../../api/cvs';
import FreelancerTopbar from '../../components/freelancer/FreelancerTopbar';

export default function CVPreviewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cv, setCV] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCVById(id)
            .then((data) => setCV(data.cv))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div style={styles.page}>
            <div style={styles.loadingCenter}>
                <div style={styles.spinner} />
                <span style={styles.loadingText}>Loading CV preview…</span>
            </div>
        </div>
    );

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Hide topbar when printing */}
                <div className="print:hidden">
                    <FreelancerTopbar
                        title="CV Preview"
                        subtitle="Review your CV layout before sharing or downloading."
                        rightAction={
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={() => navigate(`/freelancer/edit-cv/${id}`)}
                                    style={styles.editBtn}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.12)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    style={styles.printBtn}
                                    onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                                >
                                    🖨 Print / Save PDF
                                </button>
                            </div>
                        }
                    />
                </div>

                {error && (
                    <div style={styles.errorAlert}>{error}</div>
                )}

                <CVPreview cv={cv} />
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#0f0f1a', padding: '40px 16px' },
    loadingCenter: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', gap: 16,
    },
    spinner: {
        width: 32, height: 32,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    loadingText: { color: '#6b7280', fontSize: 14 },
    container: { maxWidth: 800, margin: '0 auto' },
    errorAlert: {
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        color: '#f87171', padding: '11px 16px', borderRadius: 10, fontSize: 13, marginBottom: 16,
    },
    editBtn: {
        padding: '9px 16px', background: 'transparent',
        border: '1px solid rgba(59,130,246,0.35)', borderRadius: 10,
        color: '#60a5fa', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
    },
    printBtn: {
        padding: '9px 16px', background: '#3b82f6', border: 'none',
        borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', transition: 'background 0.2s',
    },
};
