import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CVBuilder from '../../components/cv/CVBuilder';
import { fetchCVById, updateCV } from '../../api/cvs';
import FreelancerTopbar from '../../components/freelancer/FreelancerTopbar';

export default function EditCVPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cv, setCV] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCVById(id)
            .then((data) => setCV(data.cv))
            .catch((err) => setError(err.message))
            .finally(() => setFetchLoading(false));
    }, [id]);

    const handleSubmit = async (cvData) => {
        setLoading(true);
        setError('');
        try {
            await updateCV(id, cvData);
            setSuccess('Profile Synchronization Complete. Redirecting...');
            setTimeout(() => navigate('/freelancer/my-cvs'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-6">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant animate-pulse">Retrieving Profile Data...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-6">
            <div className="section-container max-w-5xl mx-auto space-y-12">
                <FreelancerTopbar
                    title="Update Professional Profile"
                    subtitle="Refine your industry standing and expertise."
                />

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <span className="material-symbols-outlined text-sm">report</span>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        {success}
                    </div>
                )}

                <div className="p-8 md:p-10 rounded-card border border-outline bg-surface-container">
                    {cv ? (
                        <CVBuilder onSubmit={handleSubmit} loading={loading} initial={cv} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                             <span className="material-symbols-outlined text-4xl opacity-20">error</span>
                             <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Profile Header Null: CV not found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
