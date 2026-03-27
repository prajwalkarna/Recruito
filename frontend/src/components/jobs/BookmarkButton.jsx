import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import axios from "axios";

export default function BookmarkButton({ jobId, size = "medium" }) {
  const { token } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      checkIfSaved();
    }
  }, [jobId, token]);

  const checkIfSaved = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/saved-jobs/check/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsSaved(response.data.isSaved);
    } catch (err) {
      console.error("Check saved error:", err);
    }
  };

  const handleToggleSave = async (e) => {
    e.stopPropagation();

    if (!token) {
      alert("Please login to save jobs");
      return;
    }

    setLoading(true);

    try {
      if (isSaved) {
        await axios.delete(`http://localhost:5000/api/saved-jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSaved(false);
      } else {
        await axios.post(
          "http://localhost:5000/api/saved-jobs",
          { job_id: jobId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err.response?.data?.error || "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    small: "w-8 h-8 text-sm",
    medium: "w-10 h-10 text-lg",
    large: "w-12 h-12 text-xl"
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={loading}
      className={`rounded-xl flex items-center justify-center transition-all duration-300 border ${
        isSaved 
        ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
        : "bg-white/5 border-white/10 text-on-surface-variant hover:border-primary/50 hover:bg-white/10"
      } ${sizeClasses[size]} ${loading ? "opacity-50 cursor-wait" : "hover:scale-110 active:scale-90"}`}
      title={isSaved ? "Remove from saved" : "Save job"}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
      ) : (
        <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isSaved ? 1 : 0}` }}>
          {isSaved ? "grade" : "grade"}
        </span>
      )}
    </button>
  );
}
