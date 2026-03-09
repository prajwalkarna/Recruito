// src/pages/freelancer/CVPreviewPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CVPreview from '../../components/cv/CVPreview';
import { fetchCVById } from '../../api/cvs';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-gray-400 animate-pulse text-sm">Loading CV preview...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 print:bg-white print:py-0">
            <div className="max-w-2xl mx-auto">
                {/* Toolbar — hidden when printing */}
                <div className="flex gap-3 mb-6 print:hidden">
                    <button onClick={() => navigate('/freelancer/my-cvs')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        My CVs
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => navigate(`/freelancer/edit-cv/${id}`)}
                        className="border border-blue-300 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                        Edit
                    </button>
                    <button onClick={() => window.print()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        🖨 Print / Save PDF
                    </button>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}

                <CVPreview cv={cv} />
            </div>
        </div>
    );
}
