import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/useAuth";
import FileUpload from "../components/common/FileUpload";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const { profile, uploadProfilePicture, updateProfile, loading } = useUser();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    bio: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleProfilePicUpload = async (file) => {
    try {
      await uploadProfilePicture(file);
      setSuccess("Profile Picture Updated.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await updateProfile(formData);
      setSuccess("Profile Details Saved.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="section-container max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase">
                Profile <span className="text-primary">Settings</span>
            </h1>
            <p className="text-on-surface-variant font-medium">Manage your personal information and profile picture.</p>
        </header>

        {success && (
            <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl text-sm font-bold animate-in fade-in">
                {success}
            </div>
        )}
        {error && (
            <div className="p-4 bg-error-container/20 border border-error-container/30 text-on-error-container rounded-xl text-sm font-bold animate-in fade-in">
                {error}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Profile Picture Section */}
            <aside className="lg:col-span-1 space-y-6">
                <div className="bg-surface-container p-8 rounded-card border border-outline flex flex-col items-center text-center space-y-6">
                    <h2 className="text-sm font-bold text-on-surface uppercase tracking-tight">Profile Picture</h2>
                    <div className="relative group">
                        <FileUpload
                          label="Upload Image"
                          accept="image/*"
                          maxSize={2}
                          preview={true}
                          currentFile={
                            profile?.profile_picture
                              ? `http://localhost:5000${profile.profile_picture}`
                              : null
                          }
                          onUpload={handleProfilePicUpload}
                        />
                    </div>
                    <p className="text-xs font-medium text-on-surface-variant">
                        Max size: 2MB. Valid formats: JPG, PNG.
                    </p>
                </div>
            </aside>

            {/* Profile Details */}
            <main className="lg:col-span-2 space-y-8">
                <section className="bg-surface-container p-8 md:p-10 rounded-card border border-outline">
                    <h2 className="text-xl font-bold text-on-surface tracking-tight mb-8 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">person_edit</span> Profile Details
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-variant block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-variant block mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all opacity-60 cursor-not-allowed"
                                    required
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-on-surface-variant block mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+1 (555) 123-4567"
                                className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-on-surface-variant block mb-1">Bio / Professional Overview</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows="5"
                                placeholder="Describe your professional background and career goals..."
                                className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-sm hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Save Changes <span className="material-symbols-outlined text-sm">save</span></>
                            )}
                        </button>
                    </form>
                </section>
            </main>
        </div>
      </div>
    </div>
  );
}
