// src/components/cv/CVBuilder.jsx
// 4-step CV builder. Used in both CreateCVPage and EditCVPage.
// Props:
//   onSubmit(cvData) — called with final assembled CV object
//   loading          — disables submit button
//   initial          — pre-fill data when editing

import { useState } from 'react';

// ─── STEP COMPONENTS ─────────────────────────────────────────

function StepPersonal({ data, onChange }) {
    const field = (name, label, type = 'text', placeholder = '') => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                value={data[name] || ''}
                onChange={(e) => onChange(name, e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CV Title</label>
                <input
                    type="text"
                    value={data.title || ''}
                    onChange={(e) => onChange('title', e.target.value)}
                    placeholder="e.g. My Software Developer CV"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            {field('full_name', 'Full Name *', 'text', 'e.g. Ronit Rai')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('email', 'Email', 'email', 'you@email.com')}
                {field('phone', 'Phone', 'tel', '+977-...')}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                <textarea
                    value={data.summary || ''}
                    onChange={(e) => onChange('summary', e.target.value)}
                    rows={4}
                    placeholder="A short paragraph about yourself, your experience, and what you're looking for..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
    );
}

function StepExperience({ data, onChange }) {
    const entries = data.experience || [];

    const addEntry = () => {
        onChange('experience', [
            ...entries,
            { company: '', role: '', start_date: '', end_date: '', description: '', current: false },
        ]);
    };

    const updateEntry = (index, field, value) => {
        const updated = entries.map((e, i) => (i === index ? { ...e, [field]: value } : e));
        onChange('experience', updated);
    };

    const removeEntry = (index) => {
        onChange('experience', entries.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {entries.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                    No experience added yet. Click below to add your first entry.
                </p>
            )}

            {entries.map((entry, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-600">Experience #{index + 1}</span>
                        <button
                            type="button"
                            onClick={() => removeEntry(index)}
                            className="text-xs text-red-500 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Company / Organization</label>
                            <input type="text" value={entry.company} onChange={(e) => updateEntry(index, 'company', e.target.value)}
                                placeholder="e.g. Google" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Role / Job Title</label>
                            <input type="text" value={entry.role} onChange={(e) => updateEntry(index, 'role', e.target.value)}
                                placeholder="e.g. Frontend Developer" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                            <input type="month" value={entry.start_date} onChange={(e) => updateEntry(index, 'start_date', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                            <input type="month" value={entry.end_date} disabled={entry.current}
                                onChange={(e) => updateEntry(index, 'end_date', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                            <label className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <input type="checkbox" checked={entry.current || false}
                                    onChange={(e) => updateEntry(index, 'current', e.target.checked)} />
                                Currently working here
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <textarea value={entry.description} onChange={(e) => updateEntry(index, 'description', e.target.value)}
                            rows={2} placeholder="Key responsibilities and achievements..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
            ))}

            <button type="button" onClick={addEntry}
                className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 rounded-lg py-2.5 text-sm font-medium transition-colors">
                + Add Experience
            </button>
        </div>
    );
}

function StepEducation({ data, onChange }) {
    const entries = data.education || [];

    const addEntry = () => {
        onChange('education', [
            ...entries,
            { institution: '', degree: '', field: '', start_date: '', end_date: '' },
        ]);
    };

    const updateEntry = (index, field, value) => {
        const updated = entries.map((e, i) => (i === index ? { ...e, [field]: value } : e));
        onChange('education', updated);
    };

    const removeEntry = (index) => {
        onChange('education', entries.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {entries.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                    No education added yet. Click below to add your first entry.
                </p>
            )}

            {entries.map((entry, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-600">Education #{index + 1}</span>
                        <button type="button" onClick={() => removeEntry(index)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Institution</label>
                        <input type="text" value={entry.institution} onChange={(e) => updateEntry(index, 'institution', e.target.value)}
                            placeholder="e.g. Itahari International College" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Degree</label>
                            <input type="text" value={entry.degree} onChange={(e) => updateEntry(index, 'degree', e.target.value)}
                                placeholder="e.g. Bachelor of Science" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Field of Study</label>
                            <input type="text" value={entry.field} onChange={(e) => updateEntry(index, 'field', e.target.value)}
                                placeholder="e.g. Computer Science" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                            <input type="month" value={entry.start_date} onChange={(e) => updateEntry(index, 'start_date', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                            <input type="month" value={entry.end_date} onChange={(e) => updateEntry(index, 'end_date', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </div>
            ))}

            <button type="button" onClick={addEntry}
                className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 rounded-lg py-2.5 text-sm font-medium transition-colors">
                + Add Education
            </button>
        </div>
    );
}

function StepSkills({ data, onChange }) {
    const skills = data.skills || [];
    const certifications = data.certifications || [];
    const languages = data.languages || [];
    const [skillInput, setSkillInput] = useState('');

    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (!trimmed || skills.includes(trimmed)) return;
        onChange('skills', [...skills, trimmed]);
        setSkillInput('');
    };

    const removeSkill = (skill) => {
        onChange('skills', skills.filter((s) => s !== skill));
    };

    const addCert = () => {
        onChange('certifications', [...certifications, { name: '', issuer: '', year: '' }]);
    };

    const updateCert = (index, field, value) => {
        const updated = certifications.map((c, i) => (i === index ? { ...c, [field]: value } : c));
        onChange('certifications', updated);
    };

    const removeCert = (index) => {
        onChange('certifications', certifications.filter((_, i) => i !== index));
    };

    const addLang = () => {
        onChange('languages', [...languages, { language: '', proficiency: 'Intermediate' }]);
    };

    const updateLang = (index, field, value) => {
        const updated = languages.map((l, i) => (i === index ? { ...l, [field]: value } : l));
        onChange('languages', updated);
    };

    const removeLang = (index) => {
        onChange('languages', languages.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            {/* Skills */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        placeholder="Type a skill and press Enter or Add"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={addSkill}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <span key={skill} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-900 ml-1">×</button>
                        </span>
                    ))}
                    {skills.length === 0 && (
                        <p className="text-xs text-gray-400">No skills added yet.</p>
                    )}
                </div>
            </div>

            {/* Certifications */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Certifications</label>
                <div className="space-y-3">
                    {certifications.map((cert, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-gray-500">Certification #{index + 1}</span>
                                <button type="button" onClick={() => removeCert(index)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input type="text" value={cert.name} onChange={(e) => updateCert(index, 'name', e.target.value)}
                                    placeholder="Certification name" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <input type="text" value={cert.issuer} onChange={(e) => updateCert(index, 'issuer', e.target.value)}
                                    placeholder="Issuing organization" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <input type="number" value={cert.year} onChange={(e) => updateCert(index, 'year', e.target.value)}
                                    placeholder="Year" min="2000" max="2030" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addCert}
                        className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 rounded-lg py-2 text-sm font-medium transition-colors">
                        + Add Certification
                    </button>
                </div>
            </div>

            {/* Languages */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Languages</label>
                <div className="space-y-2">
                    {languages.map((lang, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input type="text" value={lang.language} onChange={(e) => updateLang(index, 'language', e.target.value)}
                                placeholder="Language" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <select value={lang.proficiency} onChange={(e) => updateLang(index, 'proficiency', e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {['Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced', 'Native'].map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <button type="button" onClick={() => removeLang(index)} className="text-red-500 hover:text-red-700 text-lg font-bold px-1">×</button>
                        </div>
                    ))}
                    <button type="button" onClick={addLang}
                        className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 rounded-lg py-2 text-sm font-medium transition-colors">
                        + Add Language
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── STEP CONFIG ─────────────────────────────────────────────

const STEPS = [
    { label: 'Personal Info', icon: '👤' },
    { label: 'Experience',    icon: '💼' },
    { label: 'Education',     icon: '🎓' },
    { label: 'Skills',        icon: '⚡' },
];

// ─── MAIN BUILDER ─────────────────────────────────────────────

const EMPTY_CV = {
    title: '',
    full_name: '',
    email: '',
    phone: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
};

export default function CVBuilder({ onSubmit, loading = false, initial = null }) {
    const [step, setStep] = useState(0);
    const [data, setData] = useState(() => {
        if (!initial) return EMPTY_CV;
        return {
            title: initial.title || '',
            full_name: initial.full_name || '',
            email: initial.email || '',
            phone: initial.phone || '',
            summary: initial.summary || '',
            skills: initial.skills || [],
            experience: initial.experience || [],
            education: initial.education || [],
            certifications: initial.certifications || [],
            languages: initial.languages || [],
        };
    });
    const [error, setError] = useState('');

    const onChange = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const validateStep = () => {
        if (step === 0 && !data.full_name.trim()) {
            setError('Full name is required.');
            return false;
        }
        setError('');
        return true;
    };

    const next = () => {
        if (!validateStep()) return;
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const back = () => {
        setError('');
        setStep((s) => Math.max(s - 1, 0));
    };

    const handleSubmit = () => {
        if (!validateStep()) return;
        onSubmit(data);
    };

    const stepComponents = [
        <StepPersonal data={data} onChange={onChange} />,
        <StepExperience data={data} onChange={onChange} />,
        <StepEducation data={data} onChange={onChange} />,
        <StepSkills data={data} onChange={onChange} />,
    ];

    return (
        <div>
            {/* Step Indicator */}
            <div className="flex items-center mb-8">
                {STEPS.map((s, i) => (
                    <div key={i} className="flex items-center flex-1 last:flex-none">
                        <button
                            type="button"
                            onClick={() => i < step && setStep(i)}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                i === step
                                    ? 'text-blue-600'
                                    : i < step
                                    ? 'text-green-600 cursor-pointer'
                                    : 'text-gray-400 cursor-default'
                            }`}
                        >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                                i === step
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : i < step
                                    ? 'border-green-500 bg-green-500 text-white'
                                    : 'border-gray-300 text-gray-400'
                            }`}>
                                {i < step ? '✓' : i + 1}
                            </span>
                            <span className="hidden sm:block">{s.label}</span>
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Title */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {STEPS[step].icon} {STEPS[step].label}
            </h2>

            {/* Error */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Step Content */}
            <div className="min-h-[200px]">
                {stepComponents[step]}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={back}
                    disabled={step === 0}
                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                    ← Back
                </button>

                {step < STEPS.length - 1 ? (
                    <button
                        type="button"
                        onClick={next}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Next →
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        {loading ? 'Saving...' : initial ? '✓ Update CV' : '✓ Save CV'}
                    </button>
                )}
            </div>
        </div>
    );
}
