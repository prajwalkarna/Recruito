// src/components/cv/CVPreview.jsx
// Renders a full formatted CV preview.
// Usage: <CVPreview cv={cvObject} />

export default function CVPreview({ cv }) {
    if (!cv) return null;

    const Section = ({ title, children }) => (
        <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-700 border-b border-blue-100 pb-1 mb-3">
                {title}
            </h2>
            {children}
        </div>
    );

    const skills   = Array.isArray(cv.skills)         ? cv.skills         : [];
    const exp      = Array.isArray(cv.experience)      ? cv.experience      : [];
    const edu      = Array.isArray(cv.education)       ? cv.education       : [];
    const certs    = Array.isArray(cv.certifications)  ? cv.certifications  : [];
    const langs    = Array.isArray(cv.languages)       ? cv.languages       : [];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-2xl mx-auto font-sans text-gray-800 print:shadow-none print:border-none">

            {/* Header */}
            <div className="mb-6 pb-4 border-b-2 border-blue-600">
                <h1 className="text-2xl font-bold text-gray-900">{cv.full_name || 'Your Name'}</h1>
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                    {cv.email && <span>✉ {cv.email}</span>}
                    {cv.phone && <span>📞 {cv.phone}</span>}
                </div>
            </div>

            {/* Summary */}
            {cv.summary && (
                <Section title="Professional Summary">
                    <p className="text-sm text-gray-600 leading-relaxed">{cv.summary}</p>
                </Section>
            )}

            {/* Experience */}
            {exp.length > 0 && (
                <Section title="Work Experience">
                    <div className="space-y-4">
                        {exp.map((e, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-start flex-wrap gap-1">
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">{e.role || 'Role'}</p>
                                        <p className="text-sm text-blue-600">{e.company || 'Company'}</p>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {e.start_date || ''}{e.start_date && (e.current || e.end_date) ? ' – ' : ''}
                                        {e.current ? 'Present' : e.end_date || ''}
                                    </p>
                                </div>
                                {e.description && (
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{e.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Education */}
            {edu.length > 0 && (
                <Section title="Education">
                    <div className="space-y-3">
                        {edu.map((e, i) => (
                            <div key={i} className="flex justify-between items-start flex-wrap gap-1">
                                <div>
                                    <p className="font-semibold text-sm text-gray-800">
                                        {e.degree}{e.field ? ` in ${e.field}` : ''}
                                    </p>
                                    <p className="text-sm text-blue-600">{e.institution}</p>
                                </div>
                                <p className="text-xs text-gray-400">
                                    {e.start_date || ''}{e.start_date && e.end_date ? ' – ' : ''}{e.end_date || ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <Section title="Skills">
                    <div className="flex flex-wrap gap-2">
                        {skills.map((s) => (
                            <span key={s} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                                {s}
                            </span>
                        ))}
                    </div>
                </Section>
            )}

            {/* Certifications */}
            {certs.length > 0 && (
                <Section title="Certifications">
                    <div className="space-y-1">
                        {certs.map((c, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-700 font-medium">{c.name}</span>
                                <span className="text-gray-400 text-xs">
                                    {c.issuer}{c.year ? ` · ${c.year}` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Languages */}
            {langs.length > 0 && (
                <Section title="Languages">
                    <div className="flex flex-wrap gap-4">
                        {langs.map((l, i) => (
                            <div key={i} className="text-sm">
                                <span className="font-medium text-gray-700">{l.language}</span>
                                {l.proficiency && (
                                    <span className="text-gray-400 text-xs ml-1">({l.proficiency})</span>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}
