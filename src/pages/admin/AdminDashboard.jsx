import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";
import {
  Users,
  GraduationCap,
  FolderKanban,
  CheckCircle,
  Loader2,
  Clock,
  AlertCircle,
  UserPlus,
  FileText,
  Activity
} from "lucide-react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supervisorData, setSupervisorData] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/fetch-dashboard-stats");
        setStats(res.data?.data?.stats || null);

        let dist = res.data?.data?.supervisorDistribution || [];
        setSupervisorData(dist.length ? dist : [{ name: "No Data", count: 0 }]);

        const acts = res.data?.data?.recentActivities || [];
        const formattedActs = acts.map(a => ({
          title: a.title,
          desc: a.desc,
          time: new Date(a.time).toLocaleDateString() + ' ' + new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          icon: Activity,
          color: "text-blue-500",
          bg: "bg-blue-50"
        }));

        setActivitiesList(formattedActs.length ? formattedActs : [
          { title: "No recent activity", desc: "System is currently quiet.", time: "Just now", icon: Activity, color: "text-gray-500", bg: "bg-gray-50" }
        ]);

        const actions = res.data?.data?.quickActions || [
          { title: "Add Student", icon: "UserPlus", link: "/admin/manage-students", color: "text-slate-600" },
          { title: "Add Teacher", icon: "UserPlus", link: "/admin/manage-teachers", color: "text-slate-600" },
          { title: "View Reports", icon: "FileText", link: "/admin/projects", color: "text-slate-600" }
        ];
        
        const ICON_MAP = { Clock, AlertCircle, UserPlus, FileText };

        setQuickActions(actions.map(act => ({
          ...act,
          iconComponent: ICON_MAP[act.icon] || FileText
        })));

      } catch (error) {
        toast.error("Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const adminCards = [
    { title: "Total Student", count: stats?.totalStudents || 0, icon: GraduationCap, colorClass: "bg-blue-50 text-blue-600" },
    { title: "Total Professor", count: stats?.totalProfessors || 0, icon: Users, colorClass: "bg-emerald-50 text-emerald-600" },
    { title: "Pending Request", count: stats?.pendingRequests || 0, icon: Clock, colorClass: "bg-amber-50 text-amber-600" },
    { title: "Active Project", count: (stats?.totalProjects || 0) - (stats?.completedProjects || 0), icon: FolderKanban, colorClass: "bg-indigo-50 text-indigo-600" },
    { title: "Nearing Deadline", count: stats?.nearingDeadline || 0, icon: AlertCircle, colorClass: "bg-red-50 text-red-600" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm font-medium text-slate-500 mt-2">Real-time analysis and overview of the project management system and active entities.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {adminCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 capitalize">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{card.count}</h3>
            </div>
            <div className={`p-3 rounded-xl ${card.colorClass}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column: Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-800 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-500" />
            Project Distribution By Supervisor
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supervisorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {supervisorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Quick Actions & Recent Activity */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Recommended Actions</h2>
            <div className="grid grid-cols-1 gap-2">
              {quickActions.map((action, idx) => (
                <Link key={idx} to={action.link} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors w-full text-left">
                  <div className="flex items-center">
                    <action.iconComponent className={`w-4 h-4 mr-3 ${action.color}`} />
                    <span className="text-sm font-medium text-slate-700">{action.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-5">Recent Activity</h2>
            <div className="space-y-4">
              {activitiesList.map((activity, index) => (
                <div key={index} className="flex border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                  <div className={`p-2 rounded-full ${activity.bg} h-fit mt-1 mr-3 flex-shrink-0`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{activity.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{activity.desc}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
