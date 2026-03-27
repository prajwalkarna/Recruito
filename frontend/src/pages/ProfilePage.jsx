import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useUser } from "../context/UserContext";
import ratingService from "../services/ratingService";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, fetchProfile } = useUser();
  const [ratingData, setRatingData] = useState({ average_rating: 0, total_reviews: 0 });
  const [reviews, setReviews] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.id && profile?.role === 'freelancer') {
      fetchRatings(profile.id);
    }
  }, [profile]);

  const fetchRatings = async (userId) => {
    setLoadingRatings(true);
    try {
      const [avgRes, reviewsRes] = await Promise.all([
        ratingService.getAverageRating(userId),
        ratingService.getFreelancerRatings(userId)
      ]);
      setRatingData(avgRes.data);
      setReviews(reviewsRes.data.ratings);
    } catch (err) {
      console.error("Error fetching ratings:", err);
    } finally {
      setLoadingRatings(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-background pt-28 flex flex-col items-center justify-center text-on-surface-variant">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4 shadow-lg shadow-primary/20"></div>
        <p className="font-headline font-black text-[10px] uppercase tracking-[0.2em] text-on-surface opacity-60">Initializing Profile Context...</p>
      </div>
    );
  }

  if (!profile && !loading) {
    return (
        <div className="min-h-screen bg-background pt-28 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-20">person_off</span>
            <p className="font-headline font-black text-xs uppercase tracking-widest text-on-surface">Profile synchronization failed.</p>
            <button onClick={() => fetchProfile()} className="mt-4 text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Retry Connection</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-surface-container rounded-card overflow-hidden border border-outline shadow-xl">
          {/* Header */}
          <div className="relative p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 bg-surface-container-high">
            <div className="absolute inset-0 kinetic-gradient opacity-10 -z-10"></div>
            
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/20 p-1.5 overflow-hidden flex-shrink-0 shadow-2xl">
              {profile?.profile_picture ? (
                <img
                  src={`http://localhost:5000${profile.profile_picture}`}
                  className="w-full h-full rounded-full object-cover"
                  alt={profile.name}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-5xl font-black text-primary/40">
                  {profile?.name?.charAt(0) || user?.name?.charAt(0) || "?"}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface mb-2">
                {profile?.name || user?.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20">
                    {profile?.role || user?.role}
                </span>
                {profile?.role === 'freelancer' && (
                  <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-full">
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= Math.round(ratingData.average_rating) ? 'fill-current' : 'text-gray-300'}`} 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-yellow-700 dark:text-yellow-500 uppercase tracking-wider italic">
                      {ratingData.average_rating} ({ratingData.total_reviews})
                    </span>
                  </div>
                )}
                <p className="text-on-surface-variant font-medium text-sm">
                    {profile?.email || user?.email}
                </p>
              </div>
            </div>

            <button
              className="md:absolute md:top-8 md:right-8 bg-surface border border-outline hover:bg-surface-container text-on-surface px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 group"
              onClick={() => navigate("/profile/edit")}
            >
              <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">edit</span>
              Edit Profile
            </button>
          </div>

          {/* Details */}
          <div className="p-10 md:p-16 space-y-12">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                About
              </h3>
              <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                {profile?.bio || "No professional narrative established yet."}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-outline">
                <section className="space-y-6">
                    <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">contact_page</span>
                        Communication
                    </h3>
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Direct Email</label>
                            <span className="text-sm font-semibold text-on-surface">{profile?.email || user?.email}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-center md:text-left">
                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Phone Number</label>
                            <span className="text-sm font-semibold text-on-surface">{profile?.phone || "No data provided"}</span>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">verified_user</span>
                        Account Details
                    </h3>
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Member Since</label>
                            <span className="text-sm font-semibold text-on-surface">
                                {profile?.created_at
                                ? new Date(profile.created_at).toLocaleDateString()
                                : "N/A"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Professional Role</label>
                            <span className="text-primary font-black text-sm uppercase tracking-wider">{profile?.role || user?.role}</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Reviews Section */}
            {profile?.role === 'freelancer' && (
              <section className="pt-12 border-t border-outline space-y-8">
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">reviews</span>
                  Professional Reviews
                </h3>
                
                {loadingRatings ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-surface border border-outline p-8 rounded-2xl space-y-4 hover:border-primary/20 transition-all shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm overflow-hidden">
                              {review.employer_picture ? (
                                <img src={`http://localhost:5000${review.employer_picture}`} alt={review.employer_name} className="w-full h-full object-cover" />
                              ) : (
                                review.employer_name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-on-surface uppercase tracking-tight italic">{review.employer_name}</p>
                              <div className="flex text-yellow-500 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] font-black font-mono text-on-surface-variant/50 uppercase">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.review && (
                          <p className="text-xs font-medium text-on-surface-variant leading-relaxed pl-14 italic border-l-2 border-primary/10">
                            "{review.review}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12 bg-surface border border-outline border-dashed rounded-3xl opacity-50">
                    <span className="material-symbols-outlined text-4xl mb-4 block">rate_review</span>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No reviews documented in system history.</p>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
