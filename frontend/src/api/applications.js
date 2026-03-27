// src/api/applications.js

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

export const applyToJob = (applicationData) =>
    fetch(`${BASE_URL}/applications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(applicationData),
    }).then(handleResponse);

export const fetchMyApplications = () =>
    fetch(`${BASE_URL}/applications/me`, { headers: getAuthHeaders() }).then(handleResponse);

export const fetchApplicationById = (id) =>
    fetch(`${BASE_URL}/applications/${id}`, { headers: getAuthHeaders() }).then(handleResponse);

export const withdrawApplication = (id) =>
    fetch(`${BASE_URL}/applications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const checkAlreadyApplied = (jobId) =>
    fetch(`${BASE_URL}/applications/check/${jobId}`, { headers: getAuthHeaders() }).then(handleResponse);
