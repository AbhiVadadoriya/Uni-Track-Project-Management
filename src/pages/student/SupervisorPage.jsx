import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Users, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { fetchStudentProject } from "../../store/slices/studentSlice";

const SupervisorPage = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);

  const { project } = useSelector((state) => state.student);
  const dispatch = useDispatch();

  useEffect(() => {
    // Explicitly hydrate the Project payload in case the user refreshes directly on this route
    if (!project) {
        dispatch(fetchStudentProject());
    }

    const getSupervisors = async () => {
      try {
        const res = await axiosInstance.get("/student/fetch-supervisors");
        setSupervisors(res.data.supervisors || []);
      } catch (error) {
        toast.error("Failed to load supervisors");
      } finally {
        setLoading(false);
      }
    };
    getSupervisors();
  }, []);

  const handleRequest = async (supervisorId) => {
    setRequestingId(supervisorId);
    try {
      await axiosInstance.post("/student/request-supervisor", { supervisorId, projectId: project?._id });
      toast.success("Supervisor requested successfully!");
      dispatch(fetchStudentProject());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request supervisor");
    } finally {
      setRequestingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-md shadow-sm border border-slate-200 p-10 text-center">
        <h2 className="text-xl font-bold text-slate-800">No Active Project</h2>
        <p className="text-slate-500 mt-2">You need an active project to request a supervisor. Please submit a proposal first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Upper Status Row: Flat Corporate Structure exactly stripped of AI padding/corners */}
      <div className="flex flex-col space-y-6">
        
        {/* 1. Current Supervisor Box */}
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 flex flex-col w-full">
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            Current supervisor
          </h2>
          {project.supervisor ? (
             <div className="flex items-center space-x-3">
               <div>
                 <h3 className="text-base font-bold text-slate-800">{project.supervisor.name}</h3>
                 <p className="text-sm text-slate-500">{project.supervisor.email}</p>
               </div>
             </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-6">
              <p className="text-sm font-medium text-slate-600">Supervisor not assigned yet.</p>
            </div>
          )}
        </div>

        {/* 2. Project Details Box */}
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6 flex flex-col w-full">
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            Project Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Project Title</span>
                <span className="text-sm text-slate-800 font-medium">{project.title}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1.5">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                    project.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    project.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                }`}>{project.status}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Description</span>
                <span className="text-sm text-slate-600 block leading-relaxed">{project.description}</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                 <span className="text-xs font-bold text-slate-500 block mb-1">Deadline</span>
                 <span className="text-sm text-slate-800 font-medium">{project.deadline ? formatDate(project.deadline) : "Not Set"}</span>
              </div>
              <div>
                 <span className="text-xs font-bold text-slate-500 block mb-1">Created At</span>
                 <span className="text-sm text-slate-800 font-medium">{formatDate(project.createdAt)}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Available Supervisors Finder Array */}
      {!project.supervisor && (
        <div className="mt-8 bg-white rounded-md shadow-sm border border-slate-200 p-8 w-full">
          <div className="mb-8 border-b border-slate-100 pb-4">
            <h1 className="text-xl font-bold text-slate-800">Available Supervisors</h1>
            <p className="text-sm text-slate-500 mt-1">Browse professors and request supervision based on their available slots.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {supervisors.map((sup) => (
                <div key={sup._id} className="bg-white p-6 rounded-md shadow-sm border border-slate-200 hover:border-blue-400 transition-colors flex flex-col justify-start text-left">
                  
                  {/* FIRST logo the name */}
                  <div className="flex items-center space-x-4 mb-5 pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold shrink-0">
                      {sup.name?.charAt(0)}
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{sup.name}</h3>
                  </div>
                  
                  <div className="space-y-4 flex-1 mb-6">
                    {/* THEN down side department */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Department</p>
                      <p className="text-sm font-medium text-slate-800">{sup.department || "N/A"}</p>
                    </div>

                    {/* THEN down side email */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Email</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{sup.email}</p>
                    </div>
                    
                    {/* THEN down side Expertise */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Expertise</p>
                      <p className="text-sm font-medium text-slate-800 line-clamp-2">{sup.expertise || "N/A"}</p>
                    </div>
                  </div>

                  {/* 6. Request Button */}
                  <button
                    onClick={() => handleRequest(sup._id)}
                    disabled={requestingId === sup._id || project?.requests?.includes(sup._id)}
                    className="mt-auto w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 px-4 py-2 rounded-md text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requestingId === sup._id ? "Processing..." : project?.requests?.includes(sup._id) ? "Request Sent" : "Request Supervisor"}
                  </button>
                </div>
              ))}
              {supervisors.length === 0 && (
                <div className="col-span-full text-center py-16 bg-slate-50 rounded-md border border-slate-200 border-dashed">
                  <p className="text-sm text-slate-500 font-medium tracking-wide">No supervisor profiles exist in the database.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupervisorPage;
