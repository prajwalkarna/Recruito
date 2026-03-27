// src/components/cv/CVBuilder.jsx
import { useState } from 'react';

// ─── HELPER COMPONENTS ───────────────────────────────────────

const FormField = ({ label, children, error }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center justify-between">
            {label}
            {error && <span className="text-red-500 lowercase font-medium tracking-normal italic">{error}</span>}
        </label>
        {children}
    </div>
);

const Input = ({ className = '', ...props }) => (
    <input
        {...props}
        className={`w-full bg-surface-container border border-outline rounded-xl px-5 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ${className}`}
    />
);

const TextArea = ({ className = '', ...props }) => (
    <textarea
        {...props}
        className={`w-full bg-surface-container border border-outline rounded-xl px-5 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none ${className}`}
    />
);

const EntryCard = ({ title, onRemove, children, colorClass = "text-primary" }) => (
    <div className="bg-surface border border-outline rounded-2xl p-6 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-outline group-hover:bg-primary transition-colors"></div>
        <div className="flex items-center justify-between mb-6">
            <span className={`text-[10px] font-black uppercase tracking-widest ${colorClass}`}>{title}</span>
            <button
                type="button"
                onClick={onRemove}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
            >
                <span className="material-symbols-outlined text-sm">close</span>
            </button>
        </div>
        <div className="space-y-5">
            {children}
        </div>
    </div>
);

// ─── STEP COMPONENTS ─────────────────────────────────────────

function StepPersonal({ data, onChange }) {
    return (
        <div className="space-y-6">
            <FormField label="CV Title">
                <Input
                    value={data.title || ''}
                    onChange={(e) => onChange('title', e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                />
            </FormField>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Full Name">
                    <Input
                        value={data.full_name || ''}
                        onChange={(e) => onChange('full_name', e.target.value)}
                        placeholder="John Doe"
                    />
                </FormField>
                <FormField label="Email Address">
                    <Input
                        type="email"
                        value={data.email || ''}
                        onChange={(e) => onChange('email', e.target.value)}
                        placeholder="john@example.com"
                    />
                </FormField>
            </div>
            <FormField label="Phone Number">
                <Input
                    type="tel"
                    value={data.phone || ''}
                    onChange={(e) => onChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                />
            </FormField>
            <FormField label="Professional Summary">
                <TextArea
                    value={data.summary || ''}
                    onChange={(e) => onChange('summary', e.target.value)}
                    rows={5}
                    placeholder="Briefly describe your career goals and key accomplishments..."
                />
            </FormField>
        </div>
    );
}

function StepExperience({ data, onChange }) {
    const entries = data.experience || [];
    const addEntry = () => onChange('experience', [...entries, { company: '', role: '', start_date: '', end_date: '', description: '', current: false }]);
    const updateEntry = (index, field, value) => onChange('experience', entries.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
    const removeEntry = (index) => onChange('experience', entries.filter((_, i) => i !== index));

    return (
        <div className="space-y-6">
            {entries.map((entry, index) => (
                <EntryCard key={index} title={`Experience Entry #${index + 1}`} onRemove={() => removeEntry(index)} colorClass="text-indigo-400">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField label="Company Name">
                            <Input value={entry.company} onChange={(e) => updateEntry(index, 'company', e.target.value)} placeholder="e.g. TechCorp" />
                        </FormField>
                        <FormField label="Job Title">
                            <Input value={entry.role} onChange={(e) => updateEntry(index, 'role', e.target.value)} placeholder="e.g. Lead Designer" />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField label="Start Date">
                            <Input type="month" value={entry.start_date} onChange={(e) => updateEntry(index, 'start_date', e.target.value)} />
                        </FormField>
                        <div className="space-y-4">
                            <FormField label="End Date">
                                <Input type="month" value={entry.end_date} disabled={entry.current} onChange={(e) => updateEntry(index, 'end_date', e.target.value)} />
                            </FormField>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${entry.current ? 'bg-primary border-primary' : 'bg-surface-container border-outline group-hover:border-primary/50'}`}>
                                    {entry.current && <span className="material-symbols-outlined text-[14px] text-on-primary font-bold">check</span>}
                                    <input type="checkbox" className="hidden" checked={entry.current || false} onChange={(e) => updateEntry(index, 'current', e.target.checked)} />
                                </div>
                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Currently Working Here</span>
                            </label>
                        </div>
                    </div>
                    <FormField label="Key Responsibilities">
                        <TextArea value={entry.description} onChange={(e) => updateEntry(index, 'description', e.target.value)} rows={3} placeholder="Describe your impact and achievements..." />
                    </FormField>
                </EntryCard>
            ))}
            <button type="button" onClick={addEntry} className="w-full py-6 rounded-2xl border-2 border-dashed border-outline hover:border-primary hover:bg-primary/5 text-on-surface-variant hover:text-primary transition-all flex flex-col items-center gap-2 group">
                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">add_circle</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Professional Experience</span>
            </button>
        </div>
    );
}

function StepEducation({ data, onChange }) {
    const entries = data.education || [];
    const addEntry = () => onChange('education', [...entries, { institution: '', degree: '', field: '', start_date: '', end_date: '' }]);
    const updateEntry = (index, field, value) => onChange('education', entries.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
    const removeEntry = (index) => onChange('education', entries.filter((_, i) => i !== index));

    return (
        <div className="space-y-6">
            {entries.map((entry, index) => (
                <EntryCard key={index} title={`Education History #${index + 1}`} onRemove={() => removeEntry(index)} colorClass="text-emerald-400">
                    <FormField label="Institution">
                        <Input value={entry.institution} onChange={(e) => updateEntry(index, 'institution', e.target.value)} placeholder="e.g. University of Design" />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField label="Degree">
                            <Input value={entry.degree} onChange={(e) => updateEntry(index, 'degree', e.target.value)} placeholder="e.g. Bachelor's" />
                        </FormField>
                        <FormField label="Field of Study">
                            <Input value={entry.field} onChange={(e) => updateEntry(index, 'field', e.target.value)} placeholder="e.g. Digital Media" />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField label="Start Date">
                            <Input type="month" value={entry.start_date} onChange={(e) => updateEntry(index, 'start_date', e.target.value)} />
                        </FormField>
                        <FormField label="End Date">
                            <Input type="month" value={entry.end_date} onChange={(e) => updateEntry(index, 'end_date', e.target.value)} />
                        </FormField>
                    </div>
                </EntryCard>
            ))}
            <button type="button" onClick={addEntry} className="w-full py-6 rounded-2xl border-2 border-dashed border-outline hover:border-primary hover:bg-primary/5 text-on-surface-variant hover:text-primary transition-all flex flex-col items-center gap-2 group">
                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">school</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Academic Record</span>
            </button>
        </div>
    );
}

function StepSkills({ data, onChange }) {
    const [skillInput, setSkillInput] = useState('');
    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (!trimmed || (data.skills || []).includes(trimmed)) return;
        onChange('skills', [...(data.skills || []), trimmed]);
        setSkillInput('');
    };
    const removeSkill = (skill) => onChange('skills', data.skills.filter((s) => s !== skill));

    const certs = data.certifications || [];
    const addCert = () => onChange('certifications', [...certs, { name: '', issuer: '', year: '' }]);
    const updateCert = (index, field, value) => onChange('certifications', certs.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
    const removeCert = (index) => onChange('certifications', certs.filter((_, i) => i !== index));

    return (
        <div className="space-y-10">
            <div className="space-y-6">
                <FormField label="Core Competencies">
                    <div className="flex gap-4">
                        <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Press Enter to add skill..." className="flex-1" />
                        <button type="button" onClick={addSkill} className="px-6 rounded-xl bg-primary text-on-primary font-black uppercase tracking-widest text-[10px]">Add</button>
                    </div>
                </FormField>
                <div className="flex flex-wrap gap-3">
                    {data.skills?.map((skill) => (
                        <span key={skill} className="pl-4 pr-2 py-2.5 rounded-xl bg-surface-container border border-outline text-[11px] font-bold text-primary flex items-center gap-2 animate-in zoom-in-90 animate-out fade-out slide-out-to-top-1 transition-all">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="w-6 h-6 rounded-lg hover:bg-primary/10 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <FormField label="Professional Certifications" />
                <div className="space-y-4">
                    {certs.map((cert, index) => (
                        <EntryCard key={index} title={`Certification #${index + 1}`} onRemove={() => removeCert(index)} colorClass="text-slate-400">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField label="Credential Name">
                                    <Input value={cert.name} onChange={(e) => updateCert(index, 'name', e.target.value)} placeholder="e.g. AWS Solutions Architect" />
                                </FormField>
                                <FormField label="Issuing Authority">
                                    <Input value={cert.issuer} onChange={(e) => updateCert(index, 'issuer', e.target.value)} placeholder="e.g. Amazon Web Services" />
                                </FormField>
                            </div>
                        </EntryCard>
                    ))}
                    <button type="button" onClick={addCert} className="w-full py-4 rounded-xl border border-dashed border-outline hover:border-primary text-on-surface-variant hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest">+ Add Credential</button>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN BUILDER ─────────────────────────────────────────────

const STEPS = [
    { label: 'Core Details', icon: 'person' },
    { label: 'Work History', icon: 'work' },
    { label: 'Academics',    icon: 'school' },
    { label: 'Expertise',    icon: 'verified' },
];

export default function CVBuilder({ onSubmit, loading = false, initial = null }) {
    const [step, setStep] = useState(0);
    const [data, setData] = useState(initial || { title: '', full_name: '', email: '', phone: '', summary: '', skills: [], experience: [], education: [], certifications: [], languages: [] });
    const [error, setError] = useState('');

    const onChange = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
        if (error) setError('');
    };

    const next = () => {
        if (step === 0 && !data.full_name.trim()) return setError('Identification Required: Full name is mandatory.');
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Step Navigation */}
            <div className="flex items-center justify-between mb-16 relative">
                <div className="absolute top-1/2 left-0 w-full h-px bg-outline -translate-y-1/2 -z-10"></div>
                {STEPS.map((s, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => i < step && setStep(i)}
                        className={`flex flex-col items-center gap-3 transition-all ${i <= step ? 'text-primary' : 'text-on-surface-variant opacity-40'}`}
                        disabled={i > step}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                            i === step ? 'bg-primary border-primary text-on-primary scale-110 shadow-xl shadow-primary/20' : 
                            i < step ? 'bg-surface border-primary text-primary' : 'bg-surface border-outline'
                        }`}>
                            <span className="material-symbols-outlined text-xl">{i < step ? 'check' : s.icon}</span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{s.label}</span>
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-500">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {error}
                </div>
            )}

            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                {step === 0 && <StepPersonal data={data} onChange={onChange} />}
                {step === 1 && <StepExperience data={data} onChange={onChange} />}
                {step === 2 && <StepEducation data={data} onChange={onChange} />}
                {step === 3 && <StepSkills data={data} onChange={onChange} />}
            </div>

            <div className="mt-16 pt-10 border-t border-outline flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="px-8 py-4 rounded-xl border border-outline text-[10px] font-black uppercase tracking-widest hover:bg-surface-container transition-all disabled:opacity-0 disabled:pointer-events-none"
                >
                    Previous Phase
                </button>
                
                {step === STEPS.length - 1 ? (
                    <button
                        type="button"
                        onClick={() => onSubmit(data)}
                        disabled={loading}
                        className="px-10 py-4 rounded-xl bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                    >
                        {loading ? 'Processing...' : 'Review Profile'}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={next}
                        className="px-10 py-4 rounded-xl bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                    >
                        Next Phase
                    </button>
                )}
            </div>
        </div>
    );
}
