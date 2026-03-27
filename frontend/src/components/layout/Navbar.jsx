import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";
import NotificationBell from "../common/NotificationBell";
import SupportModal from "../modals/SupportModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };


  if (!user) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[1000] bg-background/80 backdrop-blur-2xl border-b border-outline py-4">
        <div className="section-container max-w-[1440px] px-8 flex items-center justify-between">
          <Link to="/dashboard" className="group">
            <h2 className="text-2xl font-black font-headline tracking-tighter italic bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              Recruito
            </h2>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {user.role === "freelancer" && (
              <>
                <NavLink to="/jobs" label="Browse Jobs" />
                <NavLink to="/freelancer/my-applications" label="Applications" />
                <NavLink to="/freelancer/my-cvs" label="My CVs" />
                <NavLink to="/freelancer/saved-jobs" label="Saved Jobs" />
              </>
            )}

            {user.role === "employer" && (
              <>
                <NavLink to="/employer/my-jobs" label="My Jobs" />
                <NavLink to="/employer/create-job" label="Post Job" />
              </>
            )}

            {user.role === "admin" && (
              <>
                <NavLink to="/admin/jobs" label="Jobs" />
                <NavLink to="/admin/users" label="Users" />
                <NavLink to="/admin/categories" label="Categories" />
              </>
            )}

            <NavLink to="/messages" label="Messages" />
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-surface-container border border-outline flex items-center justify-center text-lg hover:border-primary/50 hover:bg-surface-container-high transition-all duration-300"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            
            <NotificationBell />

            <div className="relative group">
              <div className="flex items-center gap-3 cursor-pointer py-2 px-4 rounded-xl hover:bg-surface-container transition-colors">
                <span className="text-sm font-black uppercase tracking-widest hidden lg:block">
                  {user.name}
                </span>
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-black text-primary italic uppercase">
                  {user.name?.charAt(0)}
                </div>
              </div>
              
              <div className="absolute top-full right-0 mt-2 w-56 bg-surface-container-high border border-outline rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 p-2 before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-['']">
                <DropdownLink to="/profile" icon="person" label="Profile" />
                <DropdownLink to="/settings" icon="settings" label="Settings" />
                <DropdownLink to="/email-preferences" icon="mail" label="Email Settings" />
                
                {user.role !== "admin" && (
                  <button 
                    onClick={() => setIsSupportModalOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">support_agent</span>
                    Support Contact
                  </button>
                )}

                <div className="h-px bg-outline/20 my-2 mx-2"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
      />
    </>
  );
}

function NavLink({ to, label }) {
    return (
        <Link 
            to={to} 
            className="text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors relative group py-2"
        >
            {label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
        </Link>
    );
}

function DropdownLink({ to, icon, label }) {
    return (
        <Link 
            to={to} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container text-[10px] font-black uppercase tracking-widest transition-all"
        >
            <span className="material-symbols-outlined text-sm">{icon}</span>
            {label}
        </Link>
    );
}
