// src/components/freelancer/FreelancerTopbar.jsx
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_LINKS = [
    { to: '/freelancer/my-cvs',          label: 'My CVs' },
    { to: '/freelancer/create-cv',       label: 'Build CV' },
    { to: '/freelancer/my-applications', label: 'Applications' },
];

export default function FreelancerTopbar({ title, subtitle, rightAction }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    return (
        <div style={styles.wrapper}>
            {/* Top row: title + right actions */}
            <div style={styles.topRow}>
                <div>
                    <h1 style={styles.title}>{title}</h1>
                    {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
                </div>
                <div style={styles.rightSide}>
                    {rightAction && <div>{rightAction}</div>}
                </div>
            </div>

            {/* Nav tabs */}
            <div style={styles.navRow}>
                {NAV_LINKS.map(({ to, label }) => {
                    const active = pathname === to || pathname.startsWith(to + '/');
                    return (
                        <button
                            key={to}
                            onClick={() => navigate(to)}
                            style={{
                                ...styles.navBtn,
                                ...(active ? styles.navBtnActive : styles.navBtnInactive),
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        marginBottom: 28,
    },
    topRow: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: '#f3f4f6',
        margin: 0,
    },
    subtitle: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 4,
    },
    rightSide: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
    },
    navRow: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
    },
    navBtn: {
        padding: '7px 16px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        border: '1px solid',
        transition: 'background 0.15s, color 0.15s',
    },
    navBtnActive: {
        background: '#3b82f6',
        borderColor: '#3b82f6',
        color: '#fff',
    },
    navBtnInactive: {
        background: 'transparent',
        borderColor: 'rgba(255,255,255,0.12)',
        color: '#9ca3af',
    },
};
