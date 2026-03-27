import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useAuth } from "./useAuth";

const JobContext = createContext();

export function JobProvider({ children }) {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    location: "",
    job_type: "",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    sort_by: "date",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search jobs
  const searchJobs = async (customFilters = {}, page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        ...customFilters,
        page,
        limit: pagination.limit,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await axios.get(
        "http://localhost:5000/api/jobs/search",
        { params },
      );

      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search jobs");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get single job
  const getJob = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      return response.data.job;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create job (employer)
  const createJob = async (jobData) => {
    if (!token) throw new Error("Not authenticated");

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/jobs",
        jobData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update job (employer)
  const updateJob = async (id, jobData) => {
    if (!token) throw new Error("Not authenticated");

    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/jobs/${id}`,
        jobData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete job (employer)
  const deleteJob = async (id) => {
    if (!token) throw new Error("Not authenticated");

    setLoading(true);
    setError(null);

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/jobs/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      keyword: "",
      category: "",
      location: "",
      job_type: "",
      experience_level: "",
      salary_min: "",
      salary_max: "",
      sort_by: "date",
    });
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        filters,
        pagination,
        loading,
        error,
        searchJobs,
        getJob,
        createJob,
        updateJob,
        deleteJob,
        updateFilters,
        clearFilters,
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useJobs() {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJobs must be used within JobProvider");
  }
  return context;
}
