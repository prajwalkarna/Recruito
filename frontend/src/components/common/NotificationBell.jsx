import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationBell() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setShowDropdown(false);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "application_received": return "mail";
      case "status_change": return "sync_alt";
      case "new_message": return "chat_bubble";
      case "job_saved": return "bookmark";
      default: return "notifications";
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };
    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="w-10 h-10 rounded-xl bg-surface-container border border-outline flex items-center justify-center text-lg hover:border-primary/50 hover:bg-surface-container-high transition-all duration-300 relative group"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="material-symbols-outlined transition-transform group-hover:rotate-12">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-primary rounded-full flex items-center justify-center text-[10px] font-black text-on-primary shadow-lg shadow-primary/40 border-2 border-background animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-4 w-96 bg-surface-container-high border border-outline rounded-2xl shadow-2xl z-[1100] overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
          <div className="p-5 border-b border-outline flex items-center justify-between bg-surface-container/30">
            <h3 className="text-[10px] font-black uppercase tracking-widest italic">Signals Array</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-hover transition-colors">
                Clear Unread
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-2">
            {notifications.length === 0 ? (
              <div className="py-12 text-center space-y-2 opacity-30 italic">
                <span className="material-symbols-outlined text-3xl">notifications_off</span>
                <p className="text-[9px] uppercase font-black tracking-widest">Zero telemetry detected</p>
              </div>
            ) : (
              notifications.slice(0, 8).map((notification) => (
                <div
                  key={notification.id}
                  className={`px-5 py-4 flex items-start gap-4 cursor-pointer transition-all hover:bg-surface-container-high relative group ${!notification.is_read ? 'bg-primary/[0.03]' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      notification.is_read ? 'bg-surface-container border-outline text-on-surface-variant' : 'bg-primary/20 border-primary/30 text-primary'
                  }`}>
                    <span className="material-symbols-outlined text-xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <h4 className={`text-xs font-black tracking-tight ${notification.is_read ? 'text-on-surface-variant' : 'text-on-surface'}`}>{notification.title}</h4>
                    <p className="text-[11px] font-medium text-on-surface-variant line-clamp-1 group-hover:line-clamp-none transition-all">{notification.message}</p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 pt-1 block">
                      {timeAgo(notification.created_at)}
                    </span>
                  </div>
                  <button
                    className="w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 bg-white/0 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center border border-transparent hover:border-red-500/20"
                    onClick={(e) => handleDelete(e, notification.id)}
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                    {!notification.is_read && (
                        <div className="absolute top-0 left-0 w-[2px] h-full bg-primary/40"></div>
                    )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-surface-container/30 border-t border-outline">
            <button
              className="w-full py-3 rounded-xl bg-surface-container border border-outline text-[10px] font-black uppercase tracking-widest hover:bg-surface-container-high transition-all"
              onClick={() => {
                navigate("/notifications");
                setShowDropdown(false);
              }}
            >
              Access Satellite Feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
