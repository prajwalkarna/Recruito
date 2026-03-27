import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import axios from "axios";

export default function EmailPreferencesPage() {
  const { token, user } = useAuth();
  const [preferences, setPreferences] = useState({
    application_received: true,
    status_updates: true,
    new_messages: true,
    job_recommendations: true,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/email-preferences",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.preferences) {
        setPreferences(response.data.preferences);
      }
    } catch (err) {
      console.error("Fetch preferences error:", err);
    }
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.put(
        "http://localhost:5000/api/users/email-preferences",
        { preferences },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSuccess("Notification Preferences Saved.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to sync preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="section-container max-w-3xl mx-auto space-y-12">
        <header className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
                Email <span className="text-primary">Notifications</span>
            </h1>
            <p className="text-on-surface-variant font-medium">Manage how you receive updates about applications, messages, and job alerts.</p>
        </header>

        {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in fade-in">
                {success}
            </div>
        )}
        {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in fade-in">
                {error}
            </div>
        )}

        <div className="space-y-6">
            {[
                { id: 'application_received', title: 'New Applications', detail: 'NOTIFY ME WHEN A NEW CANDIDATE APPLIES TO YOUR JOB POST.', icon: 'move_to_inbox', roles: ['employer', 'admin'] },
                { id: 'status_updates', title: 'Application Status', detail: 'ALERT WHEN AN APPLICATION STATUS CHANGES IN THE PIPELINE.', icon: 'update', roles: ['freelancer', 'admin'] },
                { id: 'new_messages', title: 'Direct Messages', detail: 'NOTIFICATIONS FOR NEW INCOMING MESSAGES FROM USERS.', icon: 'forum', roles: ['employer', 'freelancer', 'admin'] },
                { id: 'job_recommendations', title: 'New Job Alerts', detail: 'GET NOTIFIED IMMEDIATELY WHEN A NEW JOB MATCHING YOUR PROFILE IS POSTED.', icon: 'notifications_active', roles: ['freelancer', 'admin'] }
            ].filter(pref => pref.roles.includes(user?.role)).map((pref) => (
                <div key={pref.id} className="bg-surface-container p-8 rounded-card border border-outline flex items-center justify-between group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-surface border border-outline flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">{pref.icon}</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-on-surface uppercase tracking-widest italic">{pref.title}</h3>
                            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 leading-relaxed max-w-sm">{pref.detail}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleToggle(pref.id)}
                        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${preferences[pref.id] ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-surface-container-high border border-outline'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${preferences[pref.id] ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>
            ))}
        </div>

        <div className="pt-6">
            <button 
                onClick={handleSave} 
                disabled={loading} 
                className="w-full py-5 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>Save Preferences <span className="material-symbols-outlined text-sm">save</span></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}
