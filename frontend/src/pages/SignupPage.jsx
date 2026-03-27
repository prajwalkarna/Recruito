import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('freelancer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await signup(name, email, password, role);
      // alert(response.message || 'Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && data.errors.length > 0) {
        setError(data.errors[0].message);
      } else {
        setError(data?.message || data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-body overflow-hidden">
      {/* Right: Form Side (Desktop order-first/last etc.) */}
      <div className="flex items-center justify-center p-6 md:p-12 relative overflow-y-auto order-2 lg:order-1">
        <div className="lg:hidden absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
        
        <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-8 duration-500 py-10">
          <div className="mb-10">
            <h2 className="text-3xl font-bold font-headline text-primary">Recruito</h2>
          </div>


          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-4xl font-bold font-headline mb-3 text-on-surface">Join the Elite</h2>
            <p className="text-on-surface-variant text-base">Manifest your professional identity in the ecosystem.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Full Name</label>
              <input
                className="w-full bg-surface-container border border-outline/30 rounded-2xl px-5 py-4 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Julian Vane"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Primary Email</label>
              <input
                className="w-full bg-surface-container border border-outline/30 rounded-2xl px-5 py-4 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ecosystem.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Password</label>
              <input
                className="w-full bg-surface-container border border-outline/30 rounded-2xl px-5 py-4 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Node Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`py-4 rounded-2xl border text-sm font-bold transition-all flex flex-col items-center gap-1 ${
                    role === 'freelancer'
                      ? 'kinetic-gradient text-on-primary border-transparent shadow-xl shadow-primary/20'
                      : 'bg-surface-container border-outline/30 text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  onClick={() => setRole('freelancer')}
                >
                  <span className="text-xs tracking-widest uppercase">Freelancer</span>
                </button>
                <button
                  type="button"
                  className={`py-4 rounded-2xl border text-sm font-bold transition-all flex flex-col items-center gap-1 ${
                    role === 'employer'
                      ? 'kinetic-gradient text-on-primary border-transparent shadow-xl shadow-primary/20'
                      : 'bg-surface-container border-outline/30 text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  onClick={() => setRole('employer')}
                >
                  <span className="text-xs tracking-widest uppercase">Employer</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 kinetic-gradient text-on-primary py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

          </form>

          <div className="mt-12 text-center text-sm text-on-surface-variant font-medium">
            Already authenticated? <Link className="text-primary font-bold hover:underline" to="/login">Sign In</Link>
          </div>
        </div>
      </div>

      {/* Left: Illustration Side */}
      <div className="hidden lg:block relative overflow-hidden bg-surface-container order-1 lg:order-2">
        <img 
          src="/images/signup-bg.png" 
          alt="Recruito Growth" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-tl from-background via-transparent to-transparent"></div>
        
        <div className="absolute top-12 right-12 text-right max-w-[480px] z-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <h1 className="text-5xl font-extrabold font-headline mb-4 leading-tight text-on-surface">
            Scale Your <span className="text-primary italic">Trajectory</span>
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            From visionary employers to world-class talent, we provide the launchpad for your professional ascent.
          </p>
        </div>

        {/* Floating Accent Blobs */}
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
