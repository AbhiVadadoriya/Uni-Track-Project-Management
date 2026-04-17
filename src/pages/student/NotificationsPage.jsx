import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Bell, Check, Loader2, Trash2, Activity, Mail, AlertTriangle, Calendar, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { axiosInstance } from "../../lib/axios";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notification");
      // Use res.data.data based on standard backend controller wrapper format
      const fetchedStats = res.data.data;
      setNotifications(fetchedStats?.notifications || []);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notification/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error("Error marking as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put("/notification/read-all");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Error marking all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axiosInstance.delete(`/notification/${id}/delete`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Error deleting notification");
    }
  };

  // Calculate stats using isRead instead of read
  const total = notifications.length;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriority = notifications.filter(n => 
    n.priority === "high" || n.type === "rejection" || (n.message && n.message.toLowerCase().includes("rejected")) || (n.message && n.message.toLowerCase().includes("urgent"))
  ).length;
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeek = notifications.filter(n => new Date(n.createdAt) >= oneWeekAgo).length;

  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 font-sans text-gray-800">
      
      {/* Header Row */}
      <div className="bg-white p-6 rounded border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Notification</h1>
          <p className="text-[13px] text-gray-500 mt-1">Stay updated with your project progress and deadlines</p>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className={`flex items-center px-4 py-2.5 rounded text-[13px] font-semibold transition-colors ${
            unreadCount > 0 
              ? "text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100" 
              : "text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed"
          }`}
        >
          <Check className="w-4 h-4 mr-2" />
          Mark all as read
        </button>
      </div>

      {/* 4 Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50/50 p-5 rounded border border-blue-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[12px] font-bold text-blue-900 tracking-wide uppercase">Total</p>
            <h3 className="text-2xl font-black text-blue-700 mt-1">{total}</h3>
          </div>
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Activity className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-emerald-50/50 p-5 rounded border border-emerald-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[12px] font-bold text-emerald-900 tracking-wide uppercase">Unread</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{unreadCount}</h3>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-red-50/50 p-5 rounded border border-red-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[12px] font-bold text-red-900 tracking-wide uppercase">High Priority</p>
            <h3 className="text-2xl font-black text-red-700 mt-1">{highPriority}</h3>
          </div>
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-purple-50/50 p-5 rounded border border-purple-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[12px] font-bold text-purple-900 tracking-wide uppercase">This Week</p>
            <h3 className="text-2xl font-black text-purple-700 mt-1">{thisWeek}</h3>
          </div>
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded border border-gray-200">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((note) => {
            let Icon = Bell;
            let iconBoxColor = "bg-blue-100 text-blue-600";
            let typeLabel = "System";
            let typeBadgeColor = "text-gray-600 bg-gray-100 border-gray-200";

            if (note.type === "approval" || (note.message && note.message.toLowerCase().includes("accepted"))) {
                Icon = CheckCircle;
                iconBoxColor = "bg-emerald-100 text-emerald-600";
                typeLabel = "Approval";
                typeBadgeColor = "text-emerald-700 bg-emerald-100 border-emerald-200 shadow-sm";
            } else if (note.type === "rejection" || (note.message && note.message.toLowerCase().includes("rejected"))) {
                Icon = XCircle;
                iconBoxColor = "bg-red-100 text-red-600";
                typeLabel = "Alert";
                typeBadgeColor = "text-red-700 bg-red-100 border-red-200 shadow-sm";
            } else if (note.type === "feedback" || (note.message && note.message.toLowerCase().includes("feedback"))) {
                Icon = MessageSquare;
                iconBoxColor = "bg-purple-100 text-purple-600";
                typeLabel = "Feedback";
                typeBadgeColor = "text-purple-700 bg-purple-100 border-purple-200 shadow-sm";
            }

            return (
              <div key={note._id} className={`p-5 flex flex-col sm:flex-row gap-4 sm:items-start justify-between rounded border transition-colors shadow-sm ${note.isRead ? "bg-white border-gray-200" : "bg-blue-50/30 border-blue-200"}`}>
                
                {/* LEFT SIDE: Icon, Badge, and Message */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`p-3 rounded-full shrink-0 ${iconBoxColor} ${note.isRead ? "opacity-60" : "opacity-100"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="mt-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded border ${typeBadgeColor}`}>
                        {typeLabel}
                      </span>
                      {(() => {
                         const rawPriority = note.priority || (note.type === "rejection" ? "high" : "low");
                         const parsedPriority = String(rawPriority).toLowerCase();
                         return (
                           <span className={`text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded border ${
                              parsedPriority === 'high' ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' :
                              parsedPriority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-blue-50 text-blue-600 border-blue-200'
                           }`}>
                              {parsedPriority}
                           </span>
                         );
                      })()}
                    </div>
                    <p className={`text-[15px] font-semibold leading-relaxed ${note.isRead ? "text-gray-700" : "text-gray-900"}`}>
                      {note.message}
                    </p>
                    <div className="mt-2 text-[12px] font-medium flex items-center gap-1.5">
                      <span className="text-gray-500">Status:</span>
                      {note.isRead ? (
                        <span className="text-emerald-600 font-bold tracking-wide">Read</span>
                      ) : (
                        <span className="text-blue-600 font-bold tracking-wide">Unread</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: Time and Actions */}
                <div className="flex flex-col sm:items-end justify-between shrink-0 gap-4 mt-2 sm:mt-0">
                  <span className="text-[13px] font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded border border-gray-200 shadow-sm">
                    {getTimeAgo(note.createdAt)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {!note.isRead && (
                      <button onClick={() => markAsRead(note._id)} className="flex items-center text-[12px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors">
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Mark Read
                      </button>
                    )}
                    <button onClick={() => deleteNotification(note._id)} className="flex items-center text-[12px] font-semibold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
             <Bell className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">You're all caught up!</h3>
          <p className="text-gray-500 text-[13px] mt-1 max-w-sm mx-auto">There are no new notifications for your account.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
