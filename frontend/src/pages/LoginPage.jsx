import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-body overflow-hidden">
      {/* Left: Illustration Side */}
      <div className="hidden lg:block relative overflow-hidden bg-surface-container">
        <img 
          src="/images/login-bg.png" 
          alt="Recruito Vision" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-transparent"></div>
        
        <div className="absolute bottom-12 left-12 max-w-[480px] z-10 animate-in fade-in slide-in-from-left-8 duration-700">
          <h1 className="text-5xl font-extrabold font-headline mb-4 leading-tight text-on-surface">
            Unlock Your <span className="text-primary italic">Global Potential</span>
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Join the elite network connecting world-class talent with industry disruptors. Your next era starts here.
          </p>
        </div>
        
        {/* Floating Accent Blobs */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
      </div>

      {/* Right: Form Side */}
      <div className="flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        <div className="lg:hidden absolute top-[-50px] left-[-50px] w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
        
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="mb-10">
            <h2 className="text-3xl font-bold font-headline text-primary">Recruito</h2>
          </div>


          <div className="mb-8">
            <h2 className="text-4xl font-bold font-headline mb-3 text-on-surface">Welcome back</h2>
            <p className="text-on-surface-variant text-base">Sign in to orchestrate your next move.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Email</label>
              <input
                className="w-full bg-surface-container border border-outline/30 rounded-2xl px-5 py-4 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@domain.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center pl-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Password</label>
                <button 
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors"
                >
                  Forgot Password?
                </button>
              </div>


              <input
                className="w-full bg-surface-container border border-outline/30 rounded-2xl px-5 py-4 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-4 kinetic-gradient text-on-primary py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In Now'}
            </button>
          </form>

          <div className="mt-12 text-center text-sm text-on-surface-variant font-medium">
            New to the ecosystem? <Link className="text-primary font-bold hover:underline" to="/signup">Register Account</Link>
          </div>

          <ForgotPasswordModal 
            isOpen={isForgotModalOpen} 
            onClose={() => setIsForgotModalOpen(false)} 
          />
        </div>

      </div>
    </div>
  );
}
