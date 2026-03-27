import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyCVs, deleteCV, setDefaultCV, uploadCVFile } from '../../api/cvs';
import FreelancerTopbar from '../../components/freelancer/FreelancerTopbar';

export default function MyCVsPage() {
    const navigate = useNavigate();
    const [cvs, setCVs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ msg: '', type: 'success' });
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    const toggleMenu = (id, e) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === id ? null : id);
    };

    useEffect(() => {
        fetchMyCVs()
            .then((data) => setCVs(data.cvs))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));

        const closeMenu = () => setActiveMenu(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    const handleSetDefault = async (id) => {
        try {
            await setDefaultCV(id);
            setCVs((prev) => prev.map((cv) => ({ ...cv, is_default: cv.id === id })));
            showToast('Default profile updated.');
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await deleteCV(id);
            setCVs((prev) => prev.filter((cv) => cv.id !== id));
            setConfirmDelete(null);
            showToast('Profile deleted.');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleFileUpload = async (e, cvId) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            return showToast('Invalid file: Only PDF supported.', 'error');
        }

        if (file.size > 5 * 1024 * 1024) {
             return showToast('File too large: 5MB maximum.', 'error');
        }

        setUploadingId(cvId);
        try {
            const res = await uploadCVFile(cvId, file);
            setCVs(prev => prev.map(cv => cv.id === cvId ? { ...cv, file_url: res.fileUrl } : cv));
            showToast('File uploaded successfully.');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setUploadingId(null);
            e.target.value = ''; 
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-6">
            {/* Toast System */}
            {toast.msg && (
                <div className={`fixed bottom-8 right-8 z-[2000] px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-right duration-300 shadow-2xl ${
                    toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                    <span className="material-symbols-outlined text-sm">{toast.type === 'success' ? 'check_circle' : 'report'}</span>
                    {toast.msg}
                </div>
            )}

            {/* Delete Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[2100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setConfirmDelete(null)}></div>
                    <div className="relative bg-surface-container p-10 rounded-card border border-outline max-w-md w-full z-10 space-y-8 animate-in zoom-in-95 duration-300 shadow-3xl">
                        <div className="space-y-2">
                             <h2 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter">Delete Profile?</h2>
                             <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest opacity-60">Action cannot be reversed</p>
                        </div>
                        
                        <div className="p-4 bg-surface border border-outline rounded-xl">
                            <p className="text-sm font-black text-primary uppercase italic">"{confirmDelete.title}"</p>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                            <span className="material-symbols-outlined text-red-500 text-lg shrink-0">warning</span>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-relaxed">
                                This profile will be removed from all active job applications.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 bg-surface border border-outline text-on-surface-variant text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-on-surface/5 transition-all">
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleDelete(confirmDelete.id)}
                                disabled={deletingId === confirmDelete.id}
                                className="flex-1 py-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {deletingId === confirmDelete.id ? 'Deleting...' : 'Delete Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
                            My <span className="text-primary">Profiles</span>
                        </h1>
                        <p className="text-on-surface-variant font-medium">Manage your professional CVs and specialized profiles.</p>
                    </div>
                    <button
                        onClick={() => navigate('/freelancer/create-cv')}
                        className="px-8 py-4 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">add_circle</span> New Profile
                    </button>
                </header>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in fade-in">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-surface-container h-[200px] rounded-card border border-outline animate-pulse"></div>
                        ))}
                    </div>
                ) : cvs.length === 0 ? (
                    <div className="bg-surface-container p-20 rounded-card border border-outline flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <span className="material-symbols-outlined text-6xl opacity-10">description</span>
                        <div className="space-y-2">
                             <h2 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter">No Profiles Yet</h2>
                             <p className="text-on-surface-variant font-medium text-sm">Create your first professional profile to begin applying for jobs.</p>
                        </div>
                        <button onClick={() => navigate('/freelancer/create-cv')} className="px-8 py-4 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            Get Started
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cvs.map((cv) => (
                            <div key={cv.id} className={`bg-surface-container p-10 rounded-card border transition-all hover:border-primary/20 group relative overflow-hidden flex flex-col justify-between h-full ${cv.is_default ? 'bg-primary/[0.02] border-primary/20 ring-1 ring-primary/10 shadow-3xl' : 'border-outline'}`}>
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity">
                                    <span className="material-symbols-outlined text-7xl italic font-black">badge</span>
                                </div>

                                <div className="space-y-8 relative z-10">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-2 flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter group-hover:text-primary transition-colors truncate">{cv.title || 'Untitled'}</h2>
                                                {cv.is_default && (
                                                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Default</span>
                                                )}
                                            </div>
                                            <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest italic font-mono">ID: {cv.id}</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => navigate(`/freelancer/cv/${cv.id}/preview`)}
                                                className="w-10 h-10 rounded-xl bg-surface border border-outline text-on-surface-variant flex items-center justify-center hover:border-primary/40 hover:text-primary transition-all active:scale-90"
                                                title="Preview Profile"
                                            >
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                            </button>
                                            
                                            <div className="relative">
                                                <button 
                                                    onClick={(e) => toggleMenu(cv.id, e)}
                                                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${activeMenu === cv.id ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-container-high'}`}
                                                >
                                                    <span className="material-symbols-outlined text-lg">settings</span>
                                                </button>
                                                
                                                {activeMenu === cv.id && (
                                                    <div className="absolute top-12 right-0 w-56 bg-surface-container-high border border-outline rounded-2xl shadow-3xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                                        <button 
                                                            onClick={() => navigate(`/freelancer/edit-cv/${cv.id}`)}
                                                            className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-on-surface hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-4"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">edit_note</span>
                                                            Edit Profile
                                                        </button>
                                                        {!cv.is_default && (
                                                            <button 
                                                                onClick={() => handleSetDefault(cv.id)}
                                                                className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-on-surface hover:bg-emerald-500/10 hover:text-emerald-500 transition-all flex items-center gap-4"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">verified</span>
                                                                Primary Profile
                                                            </button>
                                                        )}
                                                        <div className="border-t border-outline" />
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: cv.id, title: cv.title || 'Untitled Profile' }); }}
                                                            className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-4"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete_sweep</span>
                                                            Delete Forever
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm font-black text-on-surface-variant uppercase tracking-widest italic opacity-60 truncate">
                                        {cv.full_name}
                                    </p>

                                    <div className="pt-8 border-t border-outline flex items-center justify-between">
                                         <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">Status</span>
                                            <span className="text-[10px] font-black text-on-surface uppercase tracking-widest italic">Stable</span>
                                         </div>
                                         
                                         {cv.file_url ? (
                                            <a 
                                                href={`http://localhost:5000${cv.file_url}`} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                PDF Export
                                            </a>
                                         ) : (
                                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-outline text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-primary hover:border-primary/20 transition-all cursor-pointer ${uploadingId === cv.id ? 'animate-pulse text-primary' : ''}`}>
                                                <span className="material-symbols-outlined text-sm">upload_file</span>
                                                {uploadingId === cv.id ? 'Uploading...' : 'Upload PDF'}
                                                <input type="file" accept=".pdf" className="hidden" disabled={uploadingId === cv.id} onChange={(e) => handleFileUpload(e, cv.id)} />
                                            </label>
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
