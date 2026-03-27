import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

export default function SettingsPage() {
  const { token, user, logout } = useAuth();
  const { theme, toggleTheme, accentColor } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Account info
  const [accountInfo, setAccountInfo] = useState({
    name: "",
    phone: "",
    bio: "",
  });

  // Change email
  const [emailData, setEmailData] = useState({
    new_email: "",
    password: "",
  });

  // Change password
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    job_alert_notifications: true,
    message_notifications: true,
    application_notifications: true,
  });

  // Delete account
  const [deleteData, setDeleteData] = useState({
    password: "",
    confirmation: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const settings = response.data.settings;
      setAccountInfo({
        name: settings.name || "",
        phone: settings.phone || "",
        bio: settings.bio || "",
      });

      setNotifications({
        email_notifications: settings.email_notifications ?? true,
        push_notifications: settings.push_notifications ?? true,
        job_alert_notifications: settings.job_alert_notifications ?? true,
        message_notifications: settings.message_notifications ?? true,
        application_notifications: settings.application_notifications ?? true,
      });
    } catch (err) {
      console.error("Fetch settings error:", err);
    }
  };

  const showMessage = (type, msg) => {
    if (type === "success") {
      setSuccess(msg);
      setError("");
    } else {
      setError(msg);
      setSuccess("");
    }
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 5000);
  };

  // Update account info
  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        "http://localhost:5000/api/settings/account",
        accountInfo,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showMessage("success", "Account information updated successfully");
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.error || "Failed to update account",
      );
    } finally {
      setLoading(false);
    }
  };

  // Change email
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put("http://localhost:5000/api/settings/email", emailData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage("success", "Email updated successfully. Please login again.");
      setEmailData({ new_email: "", password: "" });
      setTimeout(() => {
        logout();
        navigate("/");
      }, 2000);

    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.error || "Failed to change email",
      );
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      showMessage("error", "New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        "http://localhost:5000/api/settings/password",
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showMessage("success", "Password changed successfully");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.error || "Failed to change password",
      );
    } finally {
      setLoading(false);
    }
  };

  // Update notifications
  const handleUpdateNotifications = async () => {
    setLoading(true);

    try {
      await axios.put(
        "http://localhost:5000/api/settings/notifications",
        notifications,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showMessage("success", "Notification settings updated successfully");
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.error || "Failed to update settings",
      );
    } finally {
      setLoading(false);
    }
  };

  // Deactivate account
  const handleDeactivate = async () => {
    const password = prompt("Enter your password to deactivate account:");
    if (!password) return;

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/settings/deactivate",
        { password },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showMessage("success", "Account deactivated. Logging out...");
      setTimeout(() => {
        logout();
        navigate("/");
      }, 2000);

    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.error || "Failed to deactivate account",
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (deleteData.confirmation !== "DELETE") {
      showMessage("error", "Please type DELETE to confirm");
      return;
    }

    const confirm = window.confirm(
      "Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.",
    );

    if (!confirm) return;

    setLoading(true);

    try {
      await axios.delete("http://localhost:5000/api/settings/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: deleteData,
      });
      showMessage("success", "Account deleted successfully");
      setTimeout(() => {
        logout();
        navigate("/");
      }, 2000);
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.error || "Failed to delete account",
      );
    } finally {
      setLoading(false);
    }
  };

  // Export data
  const handleExportData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/settings/export",
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `recruito-data-${Date.now()}.json`;
      link.click();

      showMessage("success", "Data exported successfully");
    } catch (err) {
      showMessage("error", "Failed to export data");
    }
  };

  const tabs = [
    { id: "account", label: "Profile", icon: "person" },
    { id: "security", label: "Security", icon: "shield" },
    { id: "notifications", label: "Signals", icon: "notifications" },
    { id: "appearance", label: "Visuals", icon: "palette" },
    { id: "data", label: "Privacy", icon: "lock" },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="section-container max-w-5xl mx-auto">
        <header className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-on-surface uppercase">
                Account <span className="text-primary">Settings</span>
            </h1>
            <p className="text-on-surface-variant font-medium mt-2">Manage your account preferences and security settings.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Sidebar Tabs */}
            <aside className="lg:col-span-3 space-y-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-bold transition-all border ${
                            activeTab === tab.id 
                            ? "bg-primary/10 border-primary/20 text-primary shadow-sm" 
                            : "bg-background border-outline text-on-surface-variant hover:bg-surface-container hover:border-outline-variant"
                        }`}
                    >
                        <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </aside>

            {/* Content Area */}
            <main className="lg:col-span-9 bg-surface-container p-8 md:p-12 rounded-card border border-outline relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-9xl text-on-surface">settings</span>
                </div>

                {success && (
                    <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4">
                        {error}
                    </div>
                )}

                {activeTab === "account" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Profile Details</h2>
                            <form onSubmit={handleUpdateAccount} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-variant mb-1 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={accountInfo.name}
                                        onChange={(e) => setAccountInfo({ ...accountInfo, name: e.target.value })}
                                        className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 opacity-60">
                                    <label className="text-xs font-bold text-on-surface-variant mb-1 ml-1">Primary Email</label>
                                    <input type="email" value={user?.email} disabled className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface cursor-not-allowed font-medium" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-on-surface-variant mb-1 ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={accountInfo.phone}
                                        onChange={(e) => setAccountInfo({ ...accountInfo, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-on-surface-variant mb-1 ml-1">Professional Summary</label>
                                    <textarea
                                        value={accountInfo.bio}
                                        onChange={(e) => setAccountInfo({ ...accountInfo, bio: e.target.value })}
                                        rows="4"
                                        placeholder="Write a brief summary about your professional background..."
                                        className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all font-medium"
                                    />
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-sm hover:scale-[1.02] active:scale-95 transition-all">
                                        {loading ? "Saving..." : "Save Profile"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}

                {activeTab === "security" && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
                        <section className="space-y-8">
                            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Security Settings</h2>
                            
                            {/* Email Change */}
                            <div className="bg-surface border border-outline p-8 rounded-2xl space-y-6">
                                <h3 className="text-sm font-bold text-primary">Change Email</h3>
                                <form onSubmit={handleChangeEmail} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-on-surface-variant mb-1 ml-1 block">New Email Address</label>
                                        <input
                                            type="email"
                                            value={emailData.new_email}
                                            onChange={(e) => setEmailData({ ...emailData, new_email: e.target.value })}
                                            className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-on-surface-variant mb-1 ml-1 block">Confirm with Password</label>
                                        <input
                                            type="password"
                                            value={emailData.password}
                                            onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                                            className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <button type="submit" disabled={loading} className="md:col-span-2 bg-surface-container hover:bg-surface-container-high border border-outline rounded-xl py-3 text-sm font-bold text-on-surface transition-all">
                                        Change Email
                                    </button>
                                </form>
                            </div>

                            {/* Password Change */}
                            <div className="bg-surface border border-outline p-8 rounded-2xl space-y-6">
                                <h3 className="text-sm font-bold text-primary">Change Password</h3>
                                <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-on-surface-variant mb-1 ml-1 block">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-on-surface-variant mb-1 ml-1 block">New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-on-surface-variant mb-1 ml-1 block">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                            className="w-full bg-background border border-outline rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary"
                                            required
                                        />
                                    </div>
                                    <button type="submit" disabled={loading} className="md:col-span-2 bg-primary text-on-primary rounded-xl py-3 text-sm font-bold shadow-sm hover:scale-[1.01] transition-all">
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                        <section className="space-y-8">
                            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Notification Preferences</h2>
                            <div className="space-y-4">
                                {[
                                    { id: "email_notifications", label: "Email Notifications", desc: "Receive important updates via email." },
                                    { id: "push_notifications", label: "Push Notifications", desc: "Receive real-time browser notifications." },
                                    { id: "message_notifications", label: "Message Alerts", desc: "Get notified for direct messages." },
                                    { id: "application_notifications", label: "Application Updates", desc: "Get notified when your application status changes." }
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-6 bg-surface border border-outline rounded-2xl group hover:border-primary transition-all">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-on-surface tracking-tight">{item.label}</h4>
                                            <p className="text-xs font-medium text-on-surface-variant opacity-80">{item.desc}</p>
                                        </div>
                                        <button 
                                            onClick={() => setNotifications({...notifications, [item.id]: !notifications[item.id]})}
                                            className={`w-14 h-7 rounded-full transition-all relative ${notifications[item.id] ? "bg-primary" : "bg-surface-container-high"}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${notifications[item.id] ? "left-8 shadow-sm" : "left-1"}`}></div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4">
                                <button onClick={handleUpdateNotifications} disabled={loading} className="px-8 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-sm hover:scale-[1.02] active:scale-95 transition-all">
                                    Save Notification Settings
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "appearance" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                        <section className="space-y-8">
                            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Appearance Settings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-on-surface-variant block mb-1">Theme Selection</h4>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => theme === "dark" && toggleTheme()}
                                            className={`flex-1 p-6 rounded-2xl border transition-all text-center space-y-3 ${theme === "light" ? "bg-primary/10 border-primary/30 text-primary" : "bg-surface border-outline text-on-surface-variant hover:border-outline-variant"}`}
                                        >
                                            <span className="material-symbols-outlined text-3xl">light_mode</span>
                                            <span className="block text-xs font-bold uppercase tracking-widest">Light Mode</span>
                                        </button>
                                        <button 
                                            onClick={() => theme === "light" && toggleTheme()}
                                            className={`flex-1 p-6 rounded-2xl border transition-all text-center space-y-3 ${theme === "dark" ? "bg-primary/10 border-primary/30 text-primary" : "bg-surface border-outline text-on-surface-variant hover:border-outline-variant"}`}
                                        >
                                            <span className="material-symbols-outlined text-3xl">dark_mode</span>
                                            <span className="block text-xs font-bold uppercase tracking-widest">Dark Mode</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-on-surface-variant block mb-1">Accent Color</h4>
                                    <div className="p-6 bg-surface border border-outline rounded-2xl flex items-center justify-between">
                                        <div className="text-sm font-bold text-on-surface uppercase tracking-tight">Current Color</div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: accentColor }}></div>
                                            <span className="font-mono text-sm text-on-surface-variant font-bold uppercase">{accentColor}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-4">
                                <span className="material-symbols-outlined text-primary">auto_fix_high</span>
                                <p className="text-sm font-bold text-primary/80">For advanced theme options, use the global utility panel.</p>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "data" && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
                        <section className="space-y-8">
                            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Data & Privacy</h2>
                            
                            <div className="space-y-6">
                                <div className="p-8 bg-surface border border-outline rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-on-surface">Export My Data</h3>
                                        <p className="text-sm text-on-surface-variant max-w-sm">Download a complete copy of your account data and activities in JSON format.</p>
                                    </div>
                                    <button onClick={handleExportData} className="px-6 py-3 bg-surface-container border border-outline rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">download</span> Download Data
                                    </button>
                                </div>

                                <div className="p-8 bg-error-container/20 border border-error-container/30 rounded-2xl space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-on-error-container">Deactivate Account</h3>
                                        <p className="text-sm font-medium text-on-error-container/80">Temporarily disable your account. Logging back in will reactivate it.</p>
                                    </div>
                                    <button onClick={handleDeactivate} className="px-6 py-3 bg-error-container border border-error-container/50 rounded-xl text-sm font-bold text-on-error-container hover:bg-error-container/80 transition-all">
                                        Deactivate Account
                                    </button>
                                </div>

                                <div className="p-8 bg-error-container/30 border border-error-container/50 rounded-2xl space-y-8">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-bold text-on-error-container">Delete Account</h3>
                                        <p className="text-sm font-medium text-on-error-container/80">Irreversible action. Your account and all associated data will be permanently deleted.</p>
                                    </div>
                                    <form onSubmit={handleDeleteAccount} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-on-error-container/70 mb-1 ml-1 block">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    value={deleteData.password}
                                                    onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
                                                    className="w-full bg-surface border border-error-container rounded-xl px-4 py-3 text-on-surface outline-none focus:border-error-container focus:ring-1 focus:ring-error-container transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-on-error-container/70 mb-1 ml-1 block">Type "DELETE" to Confirm</label>
                                                <input
                                                    type="text"
                                                    value={deleteData.confirmation}
                                                    onChange={(e) => setDeleteData({ ...deleteData, confirmation: e.target.value })}
                                                    placeholder="DELETE"
                                                    className="w-full bg-surface border border-error-container rounded-xl px-4 py-3 text-on-surface outline-none focus:border-error-container focus:ring-1 focus:ring-error-container transition-all placeholder:text-on-error-container/40"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-3 bg-error text-on-error rounded-xl text-sm font-bold shadow-sm hover:bg-error/90 active:scale-95 transition-all">
                                            Permanently Delete Account
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
      </div>
    </div>
  );
}
