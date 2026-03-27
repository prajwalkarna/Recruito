import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CVBuilder from '../../components/cv/CVBuilder';
import CVPreview from '../../components/cv/CVPreview';
import { createCV } from '../../api/cvs';

export default function CreateCVPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [preview, setPreview] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleSubmit = async (cvData) => {
        if (!showPreview) {
            setPreview(cvData);
            setShowPreview(true);
            return;
        }
        setLoading(true);
        setError('');
        try {
            await createCV(cvData);
            setSuccess('CV Protocol Saved. Redirecting to Documents Repository...');
            setTimeout(() => navigate('/freelancer/my-cvs'), 1500);
        } catch (err) {
            setError(err.message);
            setShowPreview(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-6">
            <div className="section-container max-w-5xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter uppercase italic">
                            Professional <span className="text-primary">Profile</span>
                        </h1>
                        <p className="text-on-surface-variant font-medium max-w-2xl">
                            {showPreview 
                                ? 'Review your professional profile before saving.' 
                                : 'Build a high-impact resume with our structured editor.'}
                        </p>
                    </div>
                </header>

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

                {showPreview ? (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container border border-outline p-6 rounded-2xl">
                            <button 
                                onClick={() => setShowPreview(false)} 
                                className="px-6 py-3 bg-surface-container border border-outline rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-container-high transition-all flex items-center gap-2 group"
                            >
                                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Return to Editor
                            </button>
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => window.print()} 
                                    className="px-6 py-3 bg-surface-container border border-outline rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">download</span> Local Export (PDF)
                                </button>
                                <button 
                                    onClick={() => handleSubmit(preview)} 
                                    disabled={loading} 
                                    className="px-8 py-3 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">cloud_upload</span> Save Professional Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-card border border-outline shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary"></div>
                             <CVPreview cv={preview} />
                        </div>
                    </div>
                ) : (
                    <div className="p-8 md:p-10 rounded-card border border-outline bg-surface-container">
                        <CVBuilder onSubmit={handleSubmit} loading={loading} />
                    </div>
                )}
            </div>
        </div>
    );
}
