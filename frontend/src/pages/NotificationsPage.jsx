import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
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
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-6">
      <div className="section-container max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface uppercase">
              Notifications
            </h1>
            <p className="text-on-surface-variant font-medium">Stay updated with platform activity and messages.</p>
          </div>

          <div className="flex gap-3">
            {notifications.some((n) => !n.is_read) && (
              <button 
                onClick={markAllAsRead} 
                className="px-6 py-3 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-bold uppercase hover:bg-primary/20 transition-all active:scale-95"
              >
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={deleteAllNotifications} 
                className="px-6 py-3 bg-error-container text-on-error-container border border-error-container/50 rounded-xl text-xs font-bold uppercase hover:bg-error-container/80 transition-all active:scale-95"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-surface-container p-20 rounded-card border border-outline text-center space-y-4 animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-surface border border-outline rounded-full flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-on-surface-variant text-4xl">notifications_off</span>
              </div>
              <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">No New Notifications</h3>
              <p className="text-on-surface-variant text-sm font-medium">You're all caught up. There are no new notifications to display.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer group flex items-start gap-6 relative overflow-hidden ${
                    notification.is_read 
                    ? "bg-background border-outline opacity-80" 
                    : "bg-surface-container shadow-md border-outline ring-1 ring-primary/20"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border ${
                    notification.is_read 
                    ? "bg-surface border-outline text-on-surface-variant" 
                    : "bg-primary/10 border-primary/20 text-primary"
                  }`}>
                    <span className="material-symbols-outlined text-2xl">{getNotificationIcon(notification.type)}</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className={`text-lg font-bold tracking-tight ${notification.is_read ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                        {notification.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                        {notification.message}
                    </p>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 pt-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {timeAgo(notification.created_at)}
                    </div>
                  </div>

                  <button
                    className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-transparent border border-transparent flex items-center justify-center group-hover:bg-error-container group-hover:border-error-container/50 group-hover:text-on-error-container transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                  
                  {!notification.is_read && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
