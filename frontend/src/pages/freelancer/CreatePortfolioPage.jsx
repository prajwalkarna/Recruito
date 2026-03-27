import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import axios from "axios";
import FileUpload from "../../components/common/FileUpload";

export default function CreatePortfolioPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_url: "",
    tags: "",
  });
  const [portfolioId, setPortfolioId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tags = formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      const response = await axios.post(
        "http://localhost:5000/api/portfolio",
        { ...formData, tags },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setPortfolioId(response.data.portfolio.id);
      setSuccess("Project details saved. Please proceed to upload assets.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save project details");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!portfolioId) {
      throw new Error("Please save project details before uploading assets.");
    }

    const formData = new FormData();
    formData.append("portfolioFile", file);

    try {
      await axios.post(
        `http://localhost:5000/api/portfolio/${portfolioId}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setSuccess("Assets uploaded successfully.");
      setTimeout(() => {
        navigate("/freelancer/my-portfolio");
      }, 1500);
    } catch (err) {
      throw new Error(err.response?.data?.error || "Asset upload failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-outline">
          <div className="space-y-4">
            <button
                onClick={() => navigate("/freelancer/my-portfolio")}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors group"
            >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Portfolio
            </button>
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
              Add <span className="text-primary">Project</span>
            </h1>
            <p className="text-on-surface-variant font-medium text-sm lg:text-base opacity-70">Add a new professional project or study to your portfolio.</p>
          </div>
        </header>

        {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in italic">
                {error}
            </div>
        )}
        {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in italic">
                {success}
            </div>
        )}

        <div className="grid grid-cols-1 gap-10">
          <section className={`bg-surface-container p-10 md:p-12 rounded-card border shadow-sm transition-all duration-500 ${portfolioId ? 'border-primary/20 opacity-60' : 'border-outline'}`}>
            <h2 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic mb-10 flex items-center gap-3 border-b border-outline pb-6">
                <span className="material-symbols-outlined text-primary">description</span> Project Details
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-[0.2em] ml-1">Project Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., E-commerce Redesign"
                      className="w-full bg-surface border border-outline rounded-xl px-4 py-4 text-xs font-bold text-on-surface focus:outline-none focus:border-primary transition-all shadow-sm disabled:opacity-50 disabled:bg-surface-container disabled:cursor-not-allowed placeholder:text-on-surface-variant/40"
                      required
                      disabled={portfolioId !== null}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-[0.2em] ml-1">Project URL</label>
                    <input
                      type="url"
                      name="project_url"
                      value={formData.project_url}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="w-full bg-surface border border-outline rounded-xl px-4 py-4 text-xs font-bold text-on-surface focus:outline-none focus:border-primary transition-all shadow-sm disabled:opacity-50 disabled:bg-surface-container disabled:cursor-not-allowed placeholder:text-on-surface-variant/40"
                      disabled={portfolioId !== null}
                    />
                  </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-[0.2em] ml-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe your role, responsibilities, and achievements..."
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-4 text-xs font-medium text-on-surface focus:outline-none focus:border-primary transition-all shadow-sm disabled:opacity-50 disabled:bg-surface-container disabled:cursor-not-allowed placeholder:text-on-surface-variant/40 resize-none leading-relaxed"
                  disabled={portfolioId !== null}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-[0.2em] ml-1">Skills & Tags (Comma Separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="React, Figma, SEO, UI Design"
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-4 text-xs font-bold text-on-surface focus:outline-none focus:border-primary transition-all shadow-sm disabled:opacity-50 disabled:bg-surface-container disabled:cursor-not-allowed placeholder:text-on-surface-variant/40"
                  disabled={portfolioId !== null}
                />
              </div>

              {!portfolioId && (
                <div className="pt-4 border-t border-outline">
                    <button 
                        type="submit" 
                        disabled={loading || !formData.title} 
                        className="w-full py-5 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                      ) : (
                        <>Save Details & Continue <span className="material-symbols-outlined text-sm">arrow_forward</span></>
                      )}
                    </button>
                </div>
              )}
            </form>
          </section>

          {portfolioId && (
            <section className="bg-surface-container p-10 md:p-12 rounded-card border border-primary/20 shadow-lg animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-[100px] text-primary">cloud_upload</span>
              </div>
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] italic flex items-center gap-3 border-b border-primary/20 pb-6 mb-8 relative z-10">
                  <span className="material-symbols-outlined text-lg">image</span> Project Media
              </h2>
              
              <div className="space-y-8 relative z-10">
                  <p className="text-on-surface-variant text-sm font-medium">Upload a thumbnail, screenshot, or PDF document for this project.</p>

                  <div className="p-8 bg-surface rounded-2xl border-2 border-dashed border-outline hover:border-primary/40 transition-colors">
                      <FileUpload
                        label="Project Asset (Image/PDF)"
                        accept="image/*,application/pdf"
                        maxSize={10}
                        preview={true}
                        onUpload={handleFileUpload}
                      />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-outline">
                    <button
                      onClick={() => navigate("/freelancer/my-portfolio")}
                      className="px-8 py-4 bg-surface border border-outline rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-on-surface hover:bg-surface-container-high transition-all shadow-sm"
                    >
                      Skip Upload
                    </button>
                  </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
