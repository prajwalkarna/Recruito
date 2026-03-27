// src/components/cv/CVPreview.jsx
import React from 'react';

const CVSection = ({ title, children, icon }) => (
    <section className="mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-outline/30">
            <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-on-surface">{title}</h2>
        </div>
        <div className="pl-9 space-y-6">
            {children}
        </div>
    </section>
);

export default function CVPreview({ cv }) {
    if (!cv) return null;

    const skills = cv.skills || [];
    const experience = cv.experience || [];
    const education = cv.education || [];
    const certifications = cv.certifications || [];

    return (
        <div className="bg-white text-slate-900 min-h-[1100px] shadow-2xl rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden font-body selection:bg-primary/20 selection:text-primary">
            {/* Design Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-indigo-500 to-transparent opacity-20"></div>

            {/* Header */}
            <header className="mb-16 relative">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-slate-900 leading-none italic uppercase">
                        {cv.full_name || 'Anonymous'}
                    </h1>
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
                        {cv.email && (
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">mail</span>
                                {cv.email}
                            </div>
                        )}
                        {cv.phone && (
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">call</span>
                                {cv.phone}
                            </div>
                        )}
                    </div>
                </div>
                {cv.summary && (
                    <div className="mt-10 max-w-3xl">
                        <p className="text-lg text-slate-600 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6">
                            "{cv.summary}"
                        </p>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-2">
                    {/* Experience */}
                    {experience.length > 0 && (
                        <CVSection title="Work History" icon="work">
                            {experience.map((exp, i) => (
                                <div key={i} className="relative group">
                                    <div className="absolute left-[-2.25rem] top-2 w-1.5 h-1.5 rounded-full bg-primary ring-4 ring-primary/10"></div>
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h3 className="text-xl font-headline font-bold text-slate-900">{exp.role}</h3>
                                            <p className="text-md font-bold text-primary italic uppercase tracking-wider">{exp.company}</p>
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                            {exp.start_date} — {exp.current ? 'PRESENT' : exp.end_date}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">{exp.description}</p>
                                </div>
                            ))}
                        </CVSection>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <CVSection title="Academic Background" icon="school">
                            {education.map((edu, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute left-[-2.25rem] top-2 w-1.5 h-1.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10"></div>
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h3 className="text-xl font-headline font-bold text-slate-900">{edu.degree} in {edu.field}</h3>
                                            <p className="text-md font-bold text-indigo-500 italic uppercase tracking-wider">{edu.institution}</p>
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                            {edu.start_date} — {edu.end_date}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CVSection>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-12">
                    {/* Skills */}
                    {skills.length > 0 && (
                        <CVSection title="Expertise" icon="verified">
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-700 hover:border-primary transition-colors cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </CVSection>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <CVSection title="Credentials" icon="workspace_premium">
                            <div className="space-y-4">
                                {certifications.map((cert, i) => (
                                    <div key={i} className="space-y-0.5">
                                        <p className="text-sm font-bold text-slate-900">{cert.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cert.issuer}</p>
                                    </div>
                                ))}
                            </div>
                        </CVSection>
                    )}
                </div>
            </div>

            {/* Footer Sign-off */}
            <footer className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
                <span>Verified Professional Manifest</span>
                <span>Recruito ID: {cv.id?.slice(0, 8) || 'PENDING'}</span>
            </footer>
        </div>
    );
}
