import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import axios from "axios";
import StatusBadge from "../../components/applications/StatusBadge";
import RatingModal from "../../components/ratings/RatingModal";

export default function ApplicantDetailsPage() {
  const { applicationId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  useEffect(() => {
    fetchApplicantDetails();
  }, [applicationId]);

  const fetchApplicantDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/applications/${applicationId}/details`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setApplication(response.data.application);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load applicant details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchApplicantDetails();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-6 text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-primary animate-pulse italic">Retrieving Candidate Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="bg-surface-container p-12 rounded-card border border-red-500/20 max-w-md space-y-6 shadow-2xl">
              <span className="material-symbols-outlined text-red-500 text-6xl">error</span>
              <h2 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter">System Error</h2>
              <p className="text-on-surface-variant uppercase text-[10px] font-bold tracking-[0.2em] leading-relaxed">{error}</p>
          </div>
      </div>
    );
  }

  if (!application) return null;

  const { applicant, cv } = application;

  const safeParse = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch (e) { return []; }
    }
    return Array.isArray(data) ? data : [];
  };

  const skills = safeParse(cv?.skills);
  const experience = safeParse(cv?.experience);
  const education = safeParse(cv?.education);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-outline">
            <div className="space-y-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors group">
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Back to Pipeline
                </button>
                <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase italic">
                    Candidate <span className="text-primary">Profile</span>
                </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {application.status === 'accepted' && (
                  <button 
                      onClick={() => setIsRatingModalOpen(true)}
                      className="px-6 py-4 bg-yellow-500 text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 shadow-sm shadow-yellow-500/20"
                  >
                      <span className="material-symbols-outlined text-sm">star</span> Rate Freelancer
                  </button>
                )}

                <button 
                    onClick={() => navigate('/messages', { state: { userId: applicant.id, userName: applicant.name } })}
                    className="px-6 py-4 bg-surface border border-outline rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface hover:bg-surface-container-high transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <span className="material-symbols-outlined text-sm text-primary">chat_bubble</span> Message Candidate
                </button>
                
                <div className="flex bg-surface-container border border-outline p-1.5 rounded-2xl shadow-sm">
                    <button 
                        onClick={() => handleStatusUpdate("shortlisted")}
                        className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            application.status === 'shortlisted' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        Shortlist
                    </button>
                    <button 
                        onClick={() => handleStatusUpdate("accepted")}
                        className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            application.status === 'accepted' ? 'bg-emerald-500 text-on-primary shadow-lg shadow-emerald-500/20' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        Accept
                    </button>
                    <button 
                        onClick={() => handleStatusUpdate("rejected")}
                        className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            application.status === 'rejected' ? 'bg-red-500 text-on-primary shadow-lg shadow-red-500/20' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        Reject
                    </button>
                </div>
            </div>
        </header>

        <RatingModal 
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          freelancerId={applicant.id}
          jobId={application.job_id}
          freelancerName={applicant.name}
          onRatingSubmit={() => {
            // Optional: Show a success message or disable the rate button
            console.log('Rating submitted!');
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
                {/* Identity Card */}
                <section className="bg-surface-container p-12 rounded-card border border-outline space-y-10 relative overflow-hidden shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 rounded-[2rem] bg-surface border border-outline flex items-center justify-center font-black text-on-surface text-5xl italic uppercase overflow-hidden ring-4 ring-primary/5 shadow-sm shrink-0">
                            {applicant.profile_picture ? (
                                <img src={`http://localhost:5000${applicant.profile_picture}`} alt={applicant.name} className="w-full h-full object-cover" />
                            ) : (
                                applicant.name?.charAt(0)
                            )}
                        </div>
                        <div className="space-y-4 text-center md:text-left">
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                                <StatusBadge status={application.status} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 italic">
                                    Applied: {new Date(application.applied_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-on-surface uppercase italic tracking-tighter leading-none">{applicant.name}</h2>
                            <p className="text-primary font-mono text-xs uppercase tracking-[0.2em] font-bold">{applicant.email}</p>
                        </div>
                    </div>
                </section>

                {/* Cover Letter */}
                {application.cover_letter && (
                    <section className="bg-surface-container p-12 rounded-card border border-outline space-y-8 shadow-sm">
                        <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic border-b border-outline pb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">description</span> Cover Letter
                        </h3>
                        <div className="prose prose-sm max-w-none text-on-surface-variant font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6 py-2">
                            "{application.cover_letter}"
                        </div>
                    </section>
                )}

                {/* CV Content */}
                {cv ? (
                    <div className="space-y-10">
                        {cv.summary && (
                            <section className="bg-surface-container p-12 rounded-card border border-outline space-y-8 shadow-sm">
                                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic border-b border-outline pb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">person</span> Professional Summary
                                </h3>
                                <p className="text-on-surface text-sm font-medium leading-relaxed">{cv.summary}</p>
                            </section>
                        )}

                        {skills.length > 0 && (
                            <section className="bg-surface-container p-12 rounded-card border border-outline space-y-8 shadow-sm">
                                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic border-b border-outline pb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">bolt</span> Core Skills
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {skills.map((skill, idx) => (
                                        <span key={idx} className="px-5 py-2.5 bg-surface border border-outline rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface shadow-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {experience.length > 0 && (
                            <section className="bg-surface-container p-12 rounded-card border border-outline space-y-8 shadow-sm">
                                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic border-b border-outline pb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">work_history</span> Work Experience
                                </h3>
                                <div className="space-y-10">
                                    {experience.map((exp, idx) => (
                                        <div key={idx} className="relative pl-10 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-full before:bg-primary/20 before:rounded-full after:absolute after:left-[-3px] after:top-2 after:w-3 after:h-3 after:bg-primary after:rounded-full after:border-4 after:border-surface-container">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                                <div>
                                                    <h4 className="text-base font-black text-on-surface uppercase tracking-tight italic">{exp.position}</h4>
                                                    <p className="text-primary font-black uppercase text-[11px] tracking-widest mt-1">{exp.company}</p>
                                                </div>
                                                <span className="text-[10px] font-black font-mono text-on-surface-variant uppercase bg-surface px-4 py-2 border border-outline rounded-xl shadow-sm shrink-0">
                                                    {exp.startDate} — {exp.endDate || "Present"}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-on-surface-variant leading-relaxed mt-4">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {education.length > 0 && (
                            <section className="bg-surface-container p-12 rounded-card border border-outline space-y-8 shadow-sm">
                                <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.2em] italic border-b border-outline pb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">school</span> Education
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {education.map((edu, idx) => (
                                        <div key={idx} className="p-8 bg-surface border border-outline rounded-2xl space-y-4 shadow-sm group hover:border-primary/30 transition-all">
                                            <div className="flex justify-between items-start">
                                                <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors text-3xl">school</span>
                                                <span className="text-[10px] font-mono font-black text-on-surface-variant/50 border border-outline px-3 py-1 rounded-lg">{edu.startYear} — {edu.endYear}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-on-surface uppercase tracking-tight italic">{edu.degree}</h4>
                                                <p className="text-[11px] font-black uppercase tracking-widest text-primary mt-2">{edu.field}</p>
                                                <p className="text-[11px] font-medium text-on-surface-variant mt-3">{edu.school}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <div className="bg-surface-container p-12 rounded-card border border-outline flex flex-col items-center justify-center text-center space-y-6 text-on-surface-variant/40 italic shadow-sm">
                        <span className="material-symbols-outlined text-6xl opacity-50">description</span>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">No detailed resume data provided.</p>
                    </div>
                )}
            </div>

            <aside className="space-y-10">
                {/* Contact Frequency */}
                <section className="bg-surface-container p-10 rounded-card border border-outline space-y-8 shadow-sm">
                    <h3 className="text-xs font-black text-on-surface uppercase tracking-[0.2em] italic border-b border-outline pb-6">Contact Info</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Email Address</span>
                            <p className="text-xs font-black text-on-surface">{applicant.email}</p>
                        </div>
                        {applicant.phone && (
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Phone Number</span>
                                <p className="text-xs font-black text-on-surface">{applicant.phone}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Account Status</span>
                            <p className="text-xs font-black text-on-surface uppercase">Active since {new Date(applicant.member_since).getFullYear()}</p>
                        </div>
                        <button 
                            onClick={() => navigate('/messages', { state: { userId: applicant.id, userName: applicant.name } })}
                            className="w-full py-4 mt-6 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">mail</span> Send Message
                        </button>
                    </div>
                </section>

                {/* About Biometrics */}
                {applicant.bio && (
                    <section className="bg-surface-container p-10 rounded-card border border-outline space-y-6 shadow-sm">
                        <h3 className="text-xs font-black text-on-surface uppercase tracking-[0.2em] italic border-b border-outline pb-6">User Bio</h3>
                        <p className="text-xs font-medium text-on-surface-variant italic leading-relaxed">
                            "{applicant.bio}"
                        </p>
                    </section>
                )}
            </aside>
        </div>
      </div>
    </div>
  );
}
