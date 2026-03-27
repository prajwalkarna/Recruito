// src/pages/employer/CreateJobPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobForm from '../../components/jobs/JobForm';
import { createJob } from '../../api/jobs';

export default function CreateJobPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await createJob(formData);
            setSuccess('Job posted successfully! Redirecting...');
            setTimeout(() => navigate('/employer/my-jobs'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight uppercase italic font-headline">Post a New Job</h1>
                    <p className="text-on-surface-variant font-medium">Fill in the details below to attract the right candidates.</p>
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
                        <JobForm onSubmit={handleSubmit} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
}
