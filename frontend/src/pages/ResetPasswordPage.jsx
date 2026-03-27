import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. The link may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Column - Design Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden kinetic-gradient p-12 flex-col justify-between">
        <div className="relative z-10">
          <Link to="/" className="text-3xl font-black text-white italic tracking-tighter hover:opacity-80 transition-opacity">
            RECRUITO
          </Link>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className="relative h-96 w-full glass-panel rounded-card border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-[12rem] text-white/10 absolute -top-10 -right-10">key</span>
                <span className="material-symbols-outlined text-[10rem] text-primary animate-pulse">encrypted</span>
             </div>
          </div>
          <div className="mt-12 text-center">
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">Security Restoration</h1>
            <p className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">Credential re-validation protocol active</p>
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-[10px] uppercase font-black tracking-widest flex justify-between">
           <span>Core Security v4.0</span>
           <span>Status: Intercepted</span>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 bg-surface">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Identity Recovery</span>
            </div>
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">Finalize Token</h2>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-60">Authorize new authentication parameters</p>
          </header>

          {success ? (
            <div className="py-12 bg-surface-container/50 border border-outline/20 rounded-card p-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl">task_alt</span>
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Process Completed</h3>
              <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest max-w-[240px]">Credentials have been updated. Redirecting to access terminal...</p>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">New Password</label>
                <input
                  className="w-full bg-surface-container border border-outline/30 rounded-2xl px-5 py-4 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Confirm New Password</label>
                <input
                  className="w-full bg-surface-container border border-outline/30 rounded-2xl px-5 py-4 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-4 kinetic-gradient text-on-primary py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait"
                disabled={loading}
              >
                {loading ? 'Processing Update...' : 'Update Credentials'}
              </button>
            </form>
          )}

          <div className="mt-10 pt-10 border-t border-outline/10 text-center">
            <Link to="/login" className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Return to Authentication
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
