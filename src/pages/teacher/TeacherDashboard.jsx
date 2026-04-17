import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Users, Clock, CheckCircle, Loader2, Activity } from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

const TeacherDashboard = () => {
  const { authUser } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/professor/fetch-dashboard-stats");
        setStats(res.data.data.dashboardStats);
      } catch (error) {
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statsCards = [
    { title: "Assign Students", value: stats?.assignedStudentsCount || 0, icon: Users, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
    { title: "Pending requests", value: stats?.pendingRequestsCount || 0, icon: Clock, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
    { title: "Completed Projects", value: stats?.completedProjectsCount || 0, icon: CheckCircle, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Target Master Header Array */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 border border-blue-500 mb-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Teacher Dashboard</h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-100 mt-2">Manage your students and provide guidance on their projects</p>
        </div>
      </div>

      {/* Tri-Grid Stats Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 border border-slate-200 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                 <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Exclusive Single Node Activity Box precisely tracing backend structures */}
      <div className="bg-white p-8 border border-slate-200 w-full mt-6">
        <div className="flex flex-col border-b border-slate-200 pb-5 mb-5">
           <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
           <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-2">Latest notificationd and updates</p>
        </div>

        <div className="flex flex-col">
          {stats?.recentNotifications?.length > 0 ? (
            stats.recentNotifications.map((act, i) => (
              <div key={i} className="flex items-start space-x-4 py-4 border-b border-slate-100 last:border-0">
                <div className="mt-0.5 text-slate-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 text-sm font-medium leading-relaxed">{act.message}</p>
                  <div className="flex items-center space-x-2 mt-1.5">
                    {act.type && act.type.toLowerCase() !== 'general' && (
                      <>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{act.type}</p>
                        <span className="text-slate-300 text-xs">•</span>
                      </>
                    )}
                    <p className="text-xs text-slate-400 font-medium font-sans">
                      {new Date(act.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 flex items-center justify-center border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No recent activity securely loaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
