import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useUser } from "../context/UserContext";
import FileUpload from "../components/common/FileUpload";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    profile,
    updateProfile,
    uploadProfilePicture,
    fetchProfile,
    loading,
  } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile || user) {
      setFormData({
        name: profile?.name || user?.name || "",
        email: profile?.email || user?.email || "",
        phone: profile?.phone || "",
        bio: profile?.bio || "",
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
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
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  const handleProfilePicUpload = async (file) => {
    try {
      await uploadProfilePicture(file);
      setSuccess("Profile picture updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to upload picture");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tighter text-on-surface">Edit Profile</h1>
            <p className="text-on-surface-variant font-medium">Update your professional information on the platform.</p>
          </div>
          <button 
            onClick={() => navigate("/profile")} 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Profile
          </button>
        </div>

        {success && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <span className="material-symbols-outlined">check_circle</span>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Picture Upload */}
          <section className="bg-surface-container p-8 md:p-12 rounded-card border border-outline space-y-8">
            <div className="flex items-center gap-3 border-b border-outline pb-6">
              <span className="material-symbols-outlined text-primary">add_a_photo</span>
              <h2 className="text-xl font-bold text-on-surface">Profile Picture</h2>
            </div>
            <div className="flex justify-center">
                <div className="w-full max-w-md">
                    <FileUpload
                        label="Upload new profile picture"
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
            </div>
          </section>

          {/* Profile Information Form */}
          <section className="bg-surface-container p-8 md:p-12 rounded-card border border-outline space-y-8">
            <div className="flex items-center gap-3 border-b border-outline pb-6">
              <span className="material-symbols-outlined text-primary">badge</span>
              <h2 className="text-xl font-bold text-on-surface">Personal Details</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Full Name *</label>
                    <input
                        className="w-full bg-surface border border-outline rounded-xl px-5 py-3.5 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Alex Rivera"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Email Address *</label>
                    <input
                        className="w-full bg-surface border border-outline rounded-xl px-5 py-3.5 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="alex@recruito.dev"
                        required
                    />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Phone Number</label>
                <input
                    className="w-full bg-surface border border-outline rounded-xl px-5 py-3.5 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Professional Bio</label>
                <textarea
                    className="w-full bg-surface border border-outline rounded-xl px-5 py-3.5 text-on-surface text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium min-h-[160px] resize-none"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Describe your skillset and career trajectory..."
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full kinetic-gradient text-on-primary py-4 rounded-xl font-black font-headline uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:translate-y-[-2px] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving Updates..." : "Save Profile Details"}
              </button>
            </form>
          </section>

          {/* Password Change Section */}
          <section className="bg-surface-container p-8 md:p-12 rounded-card border border-outline space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary/60">security</span>
                    <h2 className="text-xl font-bold text-on-surface/80">Security Settings</h2>
                </div>
                <button
                    className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                        showPasswordForm ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-surface text-on-surface-variant border border-outline hover:bg-surface-container-high'
                    }`}
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                    {showPasswordForm ? "Cancel" : "Change Password"}
                </button>
            </div>

            {showPasswordForm && (
                <div className="pt-6 animate-in fade-in slide-in-from-top-4">
                    <PasswordChangeForm userId={user?.id} />
                </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// Password Change Component
function PasswordChangeForm({ userId }) {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuccess("Credentials updated successfully!");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Failed to update credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-2xl border border-outline">
      {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">close</span>
            {error}
          </div>
      )}
      {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check</span>
            {success}
          </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">Current Password</label>
            <input
                className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary/50 transition-all"
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                required
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">New Password</label>
                <input
                    className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary/50 transition-all"
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">Confirm Password</label>
                <input
                    className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary/50 transition-all"
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handleChange}
                    required
                />
            </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-surface-container-high hover:bg-surface-container-highest border border-outline text-on-surface py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
