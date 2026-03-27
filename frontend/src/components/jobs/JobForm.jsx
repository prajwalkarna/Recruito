// src/components/jobs/JobForm.jsx
// Reusable form for creating and editing jobs.
// Usage:
//   <JobForm onSubmit={handleSubmit} loading={loading} />               ← create
//   <JobForm onSubmit={handleSubmit} loading={loading} initial={job} /> ← edit

import { useState, useEffect } from 'react';
import { fetchCategories } from '../../api/jobs';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'freelance'];
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'any'];

const EMPTY_FORM = {
    title: '',
    description: '',
    category_id: '',
    location: '',
    salary_min: '',
    salary_max: '',
    job_type: 'full-time',
    experience_level: 'any',
    required_skills: '',
    expires_at: '',
};

const buildForm = (initial) => {
    if (!initial) return EMPTY_FORM;
    return {
        title: initial.title || '',
        description: initial.description || '',
        category_id: initial.category_id || '',
        location: initial.location || '',
        salary_min: initial.salary_min || '',
        salary_max: initial.salary_max || '',
        job_type: initial.job_type || 'full-time',
        experience_level: initial.experience_level || 'any',
        required_skills: Array.isArray(initial.required_skills)
            ? initial.required_skills.join(', ')
            : '',
        expires_at: initial.expires_at
            ? new Date(initial.expires_at).toISOString().split('T')[0]
            : '',
    };
};

export default function JobForm({ onSubmit, loading = false, initial = null }) {
    const [form, setForm] = useState(() => buildForm(initial));
    const [categories, setCategories] = useState([]);
    const [catLoading, setCatLoading] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCategories()
            .then((data) => setCategories(data.categories))
            .catch(() => setCategories([]))
            .finally(() => setCatLoading(false));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = 'Title is required.';
        if (!form.description.trim()) errs.description = 'Description is required.';
        if (!form.job_type) errs.job_type = 'Job type is required.';
        if (form.salary_min && form.salary_max && Number(form.salary_min) > Number(form.salary_max)) {
            errs.salary_max = 'Max salary must be ≥ min salary.';
        }
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        const skillsArray = form.required_skills
            ? form.required_skills.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

        onSubmit({
            ...form,
            category_id: form.category_id ? Number(form.category_id) : null,
            salary_min: form.salary_min ? Number(form.salary_min) : null,
            salary_max: form.salary_max ? Number(form.salary_max) : null,
            required_skills: skillsArray,
            expires_at: form.expires_at && form.expires_at.trim() !== '' ? form.expires_at : null,
        });
    };

    const inputClasses = "w-full bg-background border border-outline rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/50";
    const labelClasses = "block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2";
    const errorClasses = "text-error text-xs font-bold mt-1 tracking-wider";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Title */}
            <div>
                <label className={labelClasses}>
                    Job Title <span className="text-error">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                    className={`${inputClasses} ${errors.title ? 'border-error/60' : ''}`}
                />
                {errors.title && <p className={errorClasses}>{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
                <label className={labelClasses}>
                    Description <span className="text-error">*</span>
                </label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    className={`${inputClasses} min-h-[120px] resize-y ${errors.description ? 'border-error/60' : ''}`}
                />
                {errors.description && <p className={errorClasses}>{errors.description}</p>}
            </div>

            <hr className="border-t border-outline/50 my-2" />

            {/* Category + Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>Category</label>
                    <select
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}
                        className={`${inputClasses} appearance-none cursor-pointer`}
                    >
                        <option value="">{catLoading ? 'Loading...' : '— Select category —'}</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClasses}>Location</label>
                    <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Kathmandu or Remote"
                        className={inputClasses}
                    />
                </div>
            </div>

            {/* Job Type + Experience Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>
                        Job Type <span className="text-error">*</span>
                    </label>
                    <select
                        name="job_type"
                        value={form.job_type}
                        onChange={handleChange}
                        className={`${inputClasses} appearance-none cursor-pointer`}
                    >
                        {JOB_TYPES.map((t) => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                    </select>
                    {errors.job_type && <p className={errorClasses}>{errors.job_type}</p>}
                </div>

                <div>
                    <label className={labelClasses}>Experience Level</label>
                    <select
                        name="experience_level"
                        value={form.experience_level}
                        onChange={handleChange}
                        className={`${inputClasses} appearance-none cursor-pointer`}
                    >
                        {EXPERIENCE_LEVELS.map((l) => (
                            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <hr className="border-t border-outline/50 my-2" />

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>Min Salary ($)</label>
                    <input
                        type="number"
                        name="salary_min"
                        value={form.salary_min}
                        onChange={handleChange}
                        placeholder="e.g. 30000"
                        min="0"
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className={labelClasses}>Max Salary ($)</label>
                    <input
                        type="number"
                        name="salary_max"
                        value={form.salary_max}
                        onChange={handleChange}
                        placeholder="e.g. 60000"
                        min="0"
                        className={`${inputClasses} ${errors.salary_max ? 'border-error/60' : ''}`}
                    />
                    {errors.salary_max && <p className={errorClasses}>{errors.salary_max}</p>}
                </div>
            </div>

            {/* Required Skills */}
            <div>
                <label className={labelClasses}>
                    Required Skills <span className="normal-case tracking-normal font-medium text-on-surface-variant/60 ml-2">(comma separated)</span>
                </label>
                <input
                    type="text"
                    name="required_skills"
                    value={form.required_skills}
                    onChange={handleChange}
                    placeholder="e.g. React, Node.js, PostgreSQL"
                    className={inputClasses}
                />
            </div>

            {/* Expiry Date */}
            <div>
                <label className={labelClasses}>Application Deadline</label>
                <input
                    type="date"
                    name="expires_at"
                    value={form.expires_at}
                    onChange={handleChange}
                    className={`${inputClasses} dark:[color-scheme:dark]`}
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
            >
                {loading ? 'Saving...' : initial ? 'Update Job' : 'Post Job'}
            </button>
        </form>
    );
}