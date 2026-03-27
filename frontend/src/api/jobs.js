// src/api/jobs.js
// All job-related API calls. Import and use in components.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
};

// ─── PUBLIC ──────────────────────────────────────────────────

export const fetchAllJobs = () =>
    fetch(`${BASE_URL}/jobs`, { headers: getAuthHeaders() }).then(handleResponse);

export const fetchJobById = (id) =>
    fetch(`${BASE_URL}/jobs/${id}`, { headers: getAuthHeaders() }).then(handleResponse);

export const fetchCategories = () =>
    fetch(`${BASE_URL}/jobs/categories`, { headers: getAuthHeaders() }).then(handleResponse);

// ─── EMPLOYER ────────────────────────────────────────────────

export const fetchMyJobs = () =>
    fetch(`${BASE_URL}/jobs/employer/my-jobs`, { headers: getAuthHeaders() }).then(handleResponse);

export const createJob = (jobData) =>
    fetch(`${BASE_URL}/jobs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData),
    }).then(handleResponse);

export const updateJob = (id, jobData) =>
    fetch(`${BASE_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData),
    }).then(handleResponse);

export const toggleJobStatus = (id) =>
    fetch(`${BASE_URL}/jobs/${id}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const deleteJob = (id) =>
    fetch(`${BASE_URL}/jobs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(handleResponse);
