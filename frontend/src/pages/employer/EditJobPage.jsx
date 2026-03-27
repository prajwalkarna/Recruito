// src/pages/employer/EditJobPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JobForm from '../../components/jobs/JobForm';
import { fetchJobById, updateJob } from '../../api/jobs';

export default function EditJobPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchJobById(id)
            .then((data) => setJob(data.job))
            .catch((err) => setError(err.message))
            .finally(() => setFetchLoading(false));
    }, [id]);

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await updateJob(id, formData);
            setSuccess('Job updated successfully! Redirecting...');
            setTimeout(() => navigate('/employer/my-jobs'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 px-6">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">Loading job details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Back nav */}
                <button
                    onClick={() => navigate('/employer/my-jobs')}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to My Jobs
                </button>

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight uppercase italic font-headline">Edit Job</h1>
                    <p className="text-on-surface-variant font-medium">Update the details for this listing.</p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="flex items-center gap-3 bg-error-container/10 border border-error-container/30 text-error px-4 py-3 rounded-xl text-sm font-medium">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-3 rounded-xl text-sm font-medium">
                        <span className="material-symbols-outlined">check_circle</span>
                        {success}
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-surface-container p-8 md:p-10 rounded-card border border-outline shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="relative z-10">
                        {job ? (
                            <JobForm onSubmit={handleSubmit} loading={loading} initial={job} />
                        ) : (
                            <p className="text-on-surface-variant font-medium text-center py-8">Job not found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
