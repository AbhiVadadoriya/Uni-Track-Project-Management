import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentStats, fetchStudentProject } from "../../store/slices/studentSlice";
import { BookOpen, UserCheck, Clock, MessageSquare, AlertCircle, FileText, Bell, CalendarClock, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, project, loading } = useSelector((state) => state.student);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchStudentStats());
    dispatch(fetchStudentProject());
  }, [dispatch]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not Set";
    return new Date(dateStr).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const nextDeadlineStr = project?.deadline ? formatDate(project.deadline) : "N/A";
  const latestFeedback = project?.feedback && project.feedback.length > 0 
      ? project.feedback[project.feedback.length - 1] 
      : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 border border-gray-200 rounded bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 font-sans relative text-gray-800">
      
      {/* 1. Header Box (Flat Simple Structure) */}
      <div className="bg-blue-600 p-6 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Welcome back, {authUser?.name || "Student"}!</h1>
          <p className="text-[13px] text-blue-100 mt-1">Overview of your Uni Track Project Management workspace.</p>
        </div>
        
        {!project && (
          <Link to="/student/proposal" className="bg-white text-blue-600 px-5 py-2.5 rounded text-[13px] font-semibold hover:bg-blue-50 transition-colors">
            Submit Proposal
          </Link>
        )}
      </div>

      {/* 2. Top 4 KPI Boxes (Simple Corporate Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <p className="text-[13px] font-semibold text-gray-500 tracking-wide uppercase">Project Title</p>
            <h3 className="text-xl font-bold text-gray-800 truncate mt-1" title={project?.title || "No project"}>
              {project?.title || "N/A"}
            </h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-500 rounded shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <p className="text-[13px] font-semibold text-gray-500 tracking-wide uppercase">Supervisor</p>
            <h3 className="text-xl font-bold text-gray-800 truncate mt-1">
              {project?.supervisor?.name || "N/A"}
            </h3>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <p className="text-[13px] font-semibold text-gray-500 tracking-wide uppercase">Next Deadline</p>
            <h3 className="text-xl font-bold text-gray-800 truncate mt-1">
              {nextDeadlineStr}
            </h3>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-500 rounded shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <p className="text-[13px] font-semibold text-gray-500 tracking-wide uppercase">Feedback</p>
            <h3 className="text-xl font-bold text-gray-800 truncate mt-1">
              {project?.feedback?.length ? `${project.feedback.length} Entries` : "None"}
            </h3>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-500 rounded shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Main Data Grid: 4 Large Different Boxes (Flat & Minimal) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Large Box 1: Project Overview */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-700">Project Overview</h2>
          </div>
          
          <div className="p-5 flex-1 flex flex-col relative">
              {project ? (
                <div className="space-y-5">
                  <div>
                    <span className="text-[13px] font-semibold text-gray-500">Title</span>
                    <p className="text-sm font-medium text-gray-800 mt-1">{project.title}</p>
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-gray-500">Description</span>
                    <div className="text-[13px] text-gray-700 mt-1 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap">
                        {project.description}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-[13px] font-semibold text-gray-500 mb-1.5 block">Status</span>
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                              project.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' : 
                              project.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' :
                              project.status?.toLowerCase() === 'approved' ? 'bg-blue-100 text-blue-700' :
                              project.status?.toLowerCase() === 'in-progress' ? 'bg-purple-100 text-purple-700' :
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                        {project.status || "Pending"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[13px] font-semibold text-gray-500 mb-1.5 block">Submission Date</span>
                      <p className="text-sm font-medium text-gray-800">
                          {project.deadline ? formatDate(project.deadline) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-500 min-h-[150px]">
                  No project overview available.
                </div>
              )}
          </div>
        </div>

        {/* Large Box 2: Latest Feedback */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm hover:border-gray-300 transition-colors">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-gray-500" />
              <h2 className="text-base font-semibold text-gray-700 tracking-tight">Latest Feedback</h2>
            </div>
            <Link to="/student/feedback" className="text-[13px] font-bold text-blue-600 hover:text-blue-800 hover:underline">View All</Link>
          </div>
          
          <div className="p-5 flex-1 flex flex-col justify-center">
              {latestFeedback ? (
                <div className={`p-5 rounded-r border-l-4 ${
                  latestFeedback.type === 'positive' ? 'bg-emerald-50 border-emerald-500' :
                  latestFeedback.type === 'negative' ? 'bg-red-50 border-red-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-start gap-3 mb-3 border-b border-gray-200/40 pb-3">
                    <div className={`p-2 rounded-full shrink-0 ${
                          latestFeedback.type === 'positive' ? 'bg-emerald-100 text-emerald-600' :
                          latestFeedback.type === 'negative' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                    }`}>
                       {latestFeedback.type === 'positive' ? <CheckCircle className="w-5 h-5" /> : 
                        latestFeedback.type === 'negative' ? <XCircle className="w-5 h-5" /> : 
                        <MessageSquare className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                          <h3 className={`text-[16px] font-extrabold tracking-tight ${
                            latestFeedback.type === 'positive' ? 'text-emerald-900' :
                            latestFeedback.type === 'negative' ? 'text-red-900' :
                            'text-blue-900'
                          }`}>{latestFeedback.title}</h3>
                          <span className={`text-[10px] font-extrabold tracking-widest uppercase mt-1 inline-block px-2 py-0.5 rounded shadow-sm ${
                            latestFeedback.type === 'positive' ? 'bg-emerald-200 text-emerald-800' :
                            latestFeedback.type === 'negative' ? 'bg-red-200 text-red-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {latestFeedback.type}
                          </span>
                      </div>
                      <span className={`text-[12px] font-bold shrink-0 ${
                            latestFeedback.type === 'positive' ? 'text-emerald-600' :
                            latestFeedback.type === 'negative' ? 'text-red-600' :
                            'text-blue-600'
                      }`}>
                          {formatDate(latestFeedback.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className={`text-[14px] leading-relaxed font-medium whitespace-pre-wrap ml-11 ${
                          latestFeedback.type === 'positive' ? 'text-emerald-800' :
                          latestFeedback.type === 'negative' ? 'text-red-800' :
                          'text-blue-800'
                  }`}>
                    {latestFeedback.message}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-sm text-gray-500 min-h-[150px]">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100 shadow-sm">
                     <MessageSquare className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="font-semibold tracking-tight">No feedback received yet.</p>
                </div>
              )}
          </div>
        </div>

        {/* Large Box 3: Upcoming Deadline */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <CalendarClock className="w-4 h-4 mr-2 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-700">Upcoming Timeline</h2>
          </div>
          
          <div className="flex-1 p-0 overflow-y-auto min-h-[180px]">
            {dashboardStats?.upcomingDeadlines?.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {dashboardStats.upcomingDeadlines.map((item, i) => (
                  <li key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="p-2 border border-blue-100 rounded bg-blue-50 text-blue-600 shrink-0">
                        <CalendarClock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate mb-1">
                            {item.name || "Milestone"} <span className="font-normal text-gray-500">({project?.title})</span>
                        </p>
                        <p className="text-[13px] text-red-600 font-medium">{item.dueDate ? formatDate(item.dueDate) : "TBD"}</p>
                      </div>
                    </div>
                    <div className="shrink-0 ml-4">
                      {(() => {
                           if (!item.dueDate) return <span className="inline-block px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded border bg-gray-50 text-gray-700 border-gray-200">TBD</span>;
                           const days = Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                           let css = "bg-blue-50 text-blue-700 border-blue-200";
                           let text = "Upcoming";
                           if (days < 0) { css = "bg-red-50 text-red-700 border-red-200"; text = "Overdue"; }
                           else if (days === 0) { css = "bg-red-50 text-red-700 border-red-200"; text = "Due Today"; }
                           else if (days <= 3) { css = "bg-amber-50 text-amber-700 border-amber-200"; text = "Due Soon"; }
                           else if (days <= 7) { css = "bg-blue-50 text-blue-700 border-blue-200"; text = "This Week"; }
                           
                           return (
                              <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded border ${css}`}>
                                {text}
                              </span>
                           );
                      })()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-[13px] text-gray-500">
                Tracking records are currently empty.
              </div>
            )}
          </div>
        </div>

        {/* Large Box 4: Recent Notifications */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm hover:border-gray-300 transition-colors">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-4 h-4 mr-2 text-gray-500" />
              <h2 className="text-base font-semibold text-gray-700 tracking-tight">Recent Notifications</h2>
            </div>
            <Link to="/student/notifications" className="text-[13px] font-bold text-blue-600 hover:text-blue-800 hover:underline">View All</Link>
          </div>
          
          <div className="flex-1 p-0 overflow-y-auto min-h-[180px]">
            {dashboardStats?.topNotifications?.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {dashboardStats.topNotifications.map((note, i) => {
                  let Icon = Bell;
                  let colorClass = "bg-blue-50 text-blue-500 border-blue-100 group-hover:bg-blue-100 group-hover:text-blue-600";
                  
                  if (note.type === "approval" || note.message.toLowerCase().includes("accepted")) {
                      Icon = CheckCircle;
                      colorClass = "bg-emerald-50 text-emerald-500 border-emerald-100 group-hover:bg-emerald-100 group-hover:text-emerald-600";
                  } else if (note.type === "rejection" || note.message.toLowerCase().includes("rejected")) {
                      Icon = XCircle;
                      colorClass = "bg-red-50 text-red-500 border-red-100 group-hover:bg-red-100 group-hover:text-red-600";
                  } else if (note.type === "feedback" || note.message.toLowerCase().includes("feedback")) {
                      Icon = MessageSquare;
                      colorClass = "bg-purple-50 text-purple-500 border-purple-100 group-hover:bg-purple-100 group-hover:text-purple-600";
                  }

                  return (
                  <li key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group">
                     <div className={`p-2 rounded border shrink-0 transition-colors ${colorClass}`}>
                        <Icon className="w-4 h-4 shadow-sm" />
                     </div>
                    <div className="min-w-0">
                      <p className="text-[13px] leading-snug font-medium text-gray-800 mb-1">{note.message}</p>
                      <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">System Log</span>
                    </div>
                  </li>
                )})}
              </ul>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-[13px] text-gray-500 min-h-[150px]">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100 shadow-sm">
                   <Bell className="w-5 h-5 text-gray-300" />
                </div>
                <p className="font-semibold tracking-tight">No recent notifications broadcasted.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
