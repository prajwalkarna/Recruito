import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import axios from "axios";

export default function MyPortfolioPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/portfolio/my-portfolio",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPortfolio(response.data.portfolio);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/portfolio/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPortfolio(portfolio.filter((item) => item.id !== id));
      setDeleteModal({ show: false, id: null });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete portfolio item");
    }
  };

  const openDeleteModal = (id) => {
    setDeleteModal({ show: true, id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, id: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-6 text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-primary animate-pulse italic">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-12 border-b border-outline">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
              Professional <span className="text-primary">Portfolio</span>
            </h1>
            <p className="text-on-surface-variant font-medium text-sm lg:text-base opacity-70">Showcase your best projects and demonstrable capabilities.</p>
          </div>
          <button
            onClick={() => navigate("/freelancer/create-portfolio")}
            className="px-8 py-4 bg-primary text-on-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">add_photo_alternate</span> Add Project
          </button>
        </header>

        {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in italic">
                {error}
            </div>
        )}

        {portfolio.length === 0 ? (
          <div className="bg-surface-container p-20 rounded-card border border-outline flex flex-col items-center justify-center text-center space-y-8 shadow-sm">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">folder_open</span>
            <div className="space-y-2">
                 <h2 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter">Portfolio Empty</h2>
                 <p className="text-on-surface-variant font-medium text-sm">Start constructing your portfolio by adding your first project.</p>
            </div>
            <button
              onClick={() => navigate("/freelancer/create-portfolio")}
              className="px-8 py-4 bg-primary text-on-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
            >
              Add First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolio.map((item) => (
              <div key={item.id} className="bg-surface-container rounded-card border border-outline overflow-hidden flex flex-col group hover:border-primary/40 transition-all hover:-translate-y-2 shadow-sm hover:shadow-xl">
                {item.file_url ? (
                  <div className="aspect-video relative overflow-hidden bg-surface-container-high">
                    {item.file_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img
                        src={`http://localhost:5000${item.file_url}`}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 border-b border-outline">
                        <span className="material-symbols-outlined text-5xl text-primary/50">picture_as_pdf</span>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">PDF Document</p>
                      </div>
                    )}
                  </div>
                ) : (
                    <div className="aspect-video bg-surface-container-high border-b border-outline flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">category</span>
                    </div>
                )}

                <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-on-surface uppercase italic tracking-tighter group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em]">Created: {new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    {item.description && (
                      <p className="text-xs font-medium text-on-surface-variant leading-relaxed line-clamp-3 opacity-90">
                        {item.description}
                      </p>
                    )}

                    {item.tags && JSON.parse(item.tags).length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {JSON.parse(item.tags).map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-lg bg-surface border border-outline text-[9px] font-black uppercase tracking-widest text-on-surface-variant group-hover:border-primary/20 transition-all shadow-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-outline flex flex-col space-y-6">
                    {item.project_url && (
                      <a
                        href={item.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-indigo-500 transition-colors flex items-center gap-2 group/link w-fit"
                      >
                        <span className="material-symbols-outlined text-sm">link</span> External Link
                      </a>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate(`/freelancer/edit-portfolio/${item.id}`)}
                        className="flex-1 py-3 bg-surface border border-outline rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-on-surface hover:text-primary hover:border-primary/30 hover:bg-surface-container-high transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span> Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(item.id)}
                        className="flex-1 py-3 bg-surface border border-outline rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDeleteModal}></div>
          <div className="bg-surface-container p-10 rounded-card border border-red-500/20 max-w-md w-full relative z-10 space-y-8 animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="space-y-4">
                 <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                     <span className="material-symbols-outlined text-3xl">delete_forever</span>
                 </div>
                 <h2 className="text-3xl font-black text-on-surface uppercase italic tracking-tighter">Delete Project?</h2>
                 <p className="text-on-surface-variant text-sm font-medium leading-relaxed">This action will permanently remove this project and its associated files from your portfolio. This cannot be undone.</p>
            </div>
            
            <div className="flex gap-4 pt-4 border-t border-outline">
              <button 
                onClick={closeDeleteModal} 
                className="flex-1 py-4 bg-surface hover:bg-surface-container-high text-on-surface text-[10px] font-black uppercase tracking-widest rounded-xl border border-outline transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                className="flex-1 py-4 bg-red-500 text-on-primary border border-red-500/20 shadow-sm text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:scale-[1.02] transition-all"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
