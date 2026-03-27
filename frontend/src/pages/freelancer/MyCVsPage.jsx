// src/pages/freelancer/MyCVsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyCVs, deleteCV, setDefaultCV } from '../../api/cvs';

export default function MyCVsPage() {
    const navigate = useNavigate();
    const [cvs, setCVs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null); // { id, title }

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    useEffect(() => {
        fetchMyCVs()
            .then((data) => setCVs(data.cvs))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSetDefault = async (id) => {
        try {
            await setDefaultCV(id);
            setCVs((prev) => prev.map((cv) => ({ ...cv, is_default: cv.id === id })));
            showToast('Default CV updated.');
        } catch (err) {
            showToast(err.message);
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await deleteCV(id);
            setCVs((prev) => prev.filter((cv) => cv.id !== id));
            setConfirmDelete(null);
            showToast('CV deleted.');
        } catch (err) {
            showToast(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Toast */}
                {toast && (
                    <div className="fixed top-5 right-5 z-50 bg-gray-800 text-white text-sm px-4 py-3 rounded-lg shadow-lg">
                        {toast}
                    </div>
                )}

                {/* Delete Confirm Modal */}
                {confirmDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Delete CV?</h2>
                            <p className="text-sm text-gray-500 mb-1">You are about to delete:</p>
                            <p className="font-medium text-gray-800 mb-4">"{confirmDelete.title}"</p>
                            <p className="text-xs text-red-500 bg-red-50 rounded p-2 mb-5">
                                This CV will also be removed from any pending applications that used it.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmDelete(null)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button onClick={() => handleDelete(confirmDelete.id)} disabled={deletingId === confirmDelete.id}
                                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 rounded-lg text-sm font-medium">
                                    {deletingId === confirmDelete.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">My CVs</h1>
                        <p className="text-gray-500 text-sm mt-1">{cvs.length} CV{cvs.length !== 1 ? 's' : ''} saved</p>
                    </div>
                    <button onClick={() => navigate('/freelancer/create-cv')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Build New CV
                    </button>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/4" />
                            </div>
                        ))}
                    </div>
                ) : cvs.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <div className="text-5xl mb-4">📄</div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">No CVs yet</h2>
                        <p className="text-gray-400 text-sm mb-6">Build your first CV to start applying to jobs.</p>
                        <button onClick={() => navigate('/freelancer/create-cv')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                            Build Your First CV
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cvs.map((cv) => (
                            <div key={cv.id}
                                className={`bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow ${cv.is_default ? 'border-blue-300 ring-1 ring-blue-200' : 'border-gray-200'}`}>
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h2 className="font-semibold text-gray-800 text-base">{cv.title || 'Untitled CV'}</h2>
                                            {cv.is_default && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                    ⭐ Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{cv.full_name}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Last updated: {new Date(cv.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                                        {!cv.is_default && (
                                            <button onClick={() => handleSetDefault(cv.id)}
                                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                                                Set Default
                                            </button>
                                        )}
                                        <button onClick={() => navigate(`/freelancer/cv/${cv.id}/preview`)}
                                            className="text-xs px-3 py-1.5 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors">
                                            Preview
                                        </button>
                                        <button onClick={() => navigate(`/freelancer/edit-cv/${cv.id}`)}
                                            className="text-xs px-3 py-1.5 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors">
                                            Edit
                                        </button>
                                        <button onClick={() => setConfirmDelete({ id: cv.id, title: cv.title || 'Untitled CV' })}
                                            className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors">
                                            Delete
                                        </button>
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
