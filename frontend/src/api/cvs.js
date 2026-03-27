// src/api/cvs.js

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

export const fetchMyCVs = () =>
    fetch(`${BASE_URL}/cvs/me`, { headers: getAuthHeaders() }).then(handleResponse);

export const fetchCVById = (id) =>
    fetch(`${BASE_URL}/cvs/${id}`, { headers: getAuthHeaders() }).then(handleResponse);

export const createCV = (cvData) =>
    fetch(`${BASE_URL}/cvs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cvData),
    }).then(handleResponse);

export const updateCV = (id, cvData) =>
    fetch(`${BASE_URL}/cvs/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cvData),
    }).then(handleResponse);

export const setDefaultCV = (id) =>
    fetch(`${BASE_URL}/cvs/${id}/set-default`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
    }).then(handleResponse);

export const deleteCV = (id) =>
    fetch(`${BASE_URL}/cvs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    }).then(handleResponse);