// src/pages/freelancer/CreateCVPage.jsx
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
    const [preview, setPreview] = useState(null); // holds data to preview
    const [showPreview, setShowPreview] = useState(false);

    const handleSubmit = async (cvData) => {
        // Show preview first
        if (!showPreview) {
            setPreview(cvData);
            setShowPreview(true);
            return;
        }

        // Save
        setLoading(true);
        setError('');
        try {
            await createCV(cvData);
            setSuccess('CV saved! Redirecting...');
            setTimeout(() => navigate('/freelancer/my-cvs'), 1500);
        } catch (err) {
            setError(err.message);
            setShowPreview(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => navigate('/freelancer/my-cvs')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to My CVs
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {showPreview ? 'Preview Your CV' : 'Build Your CV'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {showPreview
                            ? 'Review your CV below. Go back to edit or confirm to save.'
                            : 'Complete all 4 steps to create a professional CV.'}
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}
                {success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>
                )}

                {showPreview ? (
                    <div>
                        {/* Print/Download button */}
                        <div className="flex gap-3 mb-4">
                            <button onClick={() => setShowPreview(false)}
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                ← Edit
                            </button>
                            <button onClick={() => window.print()}
                                className="border border-blue-300 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                                🖨 Print / Save as PDF
                            </button>
                            <button onClick={() => handleSubmit(preview)} disabled={loading}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                                {loading ? 'Saving...' : '✓ Confirm & Save'}
                            </button>
                        </div>
                        <CVPreview cv={preview} />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <CVBuilder onSubmit={handleSubmit} loading={loading} />
                    </div>
                )}
            </div>
        </div>
    );
}
