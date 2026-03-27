import { useState } from "react";
import axios from "axios";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 sm:p-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md glass-panel p-8 sm:p-10 rounded-card border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-9xl text-white">lock_reset</span>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <header className="mb-8 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">security</span>
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Security Protocol</span>
          </div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Recover Access</h2>
          <p className="text-on-surface-variant text-xs mt-2 uppercase font-bold tracking-widest opacity-60">Initialize credential restoration</p>
        </header>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-5xl">mail</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Transmission Successful</h3>
            <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest max-w-[280px]">Check your primary email for the restoration link. It expires in 60 minutes.</p>
            <button
              onClick={onClose}
              className="mt-6 py-3 px-8 kinetic-gradient text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Close Interface
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Identified Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@domain.com"
                className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-4 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 px-6 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-4 px-6 kinetic-gradient text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">send</span>
                    Request Link
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
