// src/pages/freelancer/EditCVPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CVBuilder from '../../components/cv/CVBuilder';
import { fetchCVById, updateCV } from '../../api/cvs';

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
            setSuccess('CV updated! Redirecting...');
            setTimeout(() => navigate('/freelancer/my-cvs'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-gray-400 animate-pulse text-sm">Loading CV...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <button onClick={() => navigate('/freelancer/my-cvs')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to My CVs
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Edit CV</h1>
                    <p className="text-gray-500 text-sm mt-1">Update your CV details across all 4 steps.</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}
                {success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {cv ? (
                        <CVBuilder onSubmit={handleSubmit} loading={loading} initial={cv} />
                    ) : (
                        <p className="text-gray-400 text-sm">CV not found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
