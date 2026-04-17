import { useEffect, useState } from "react";
import { FolderKanban, Loader2, CheckCircle, Clock, XCircle, Search, FileText, Eye, Check, X, Calendar, User, AlignLeft } from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supervisorFilter, setSupervisorFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [viewedProject, setViewedProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get("/admin/projects");
      const fetchedProjects = res.data?.data?.projects || res.data?.projects || [];
      setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading({ id, action });
    try {
      const newStatus = action === "approve" ? "approved" : "rejected";
      await axiosInstance.put(`/admin/project/${id}`, { status: newStatus });
      toast.success(`Project successfully ${newStatus}!`);

      setProjects((prev) => 
        prev.map(p => p._id === id ? { ...p, status: newStatus } : p)
      );
    } catch (error) {
       toast.error(error.response?.data?.message || `Failed to ${action} project`);
    } finally {
       setActionLoading(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.student?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status?.toLowerCase() === statusFilter;
    const matchesSupervisor = supervisorFilter === "all" || p.supervisor?.name === supervisorFilter;
    
    return matchesSearch && matchesStatus && matchesSupervisor;
  });

  const totalProjects = projects.length;
  const pendingRequests = projects.filter(p => !p.status || p.status.toLowerCase() === 'pending').length;
  const completedProjects = projects.filter(p => p.status?.toLowerCase() === 'completed').length;
  const rejectedProjects = projects.filter(p => p.status?.toLowerCase() === 'rejected').length;

  const uniqueSupervisors = Array.from(new Set(projects.map(p => p.supervisor?.name).filter(Boolean)));

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 font-sans relative text-gray-800">
      
      {/* Top metric boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Total Projects</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalProjects}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-500 rounded">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div>
             <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Pending Request</p>
             <h3 className="text-2xl font-bold text-gray-800 mt-1">{pendingRequests}</h3>
          </div>
          <div className="p-2.5 bg-yellow-50 text-yellow-500 rounded">
             <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div>
             <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Completed</p>
             <h3 className="text-2xl font-bold text-gray-800 mt-1">{completedProjects}</h3>
          </div>
          <div className="p-2.5 bg-green-50 text-green-500 rounded">
             <CheckCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div>
             <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Rejected</p>
             <h3 className="text-2xl font-bold text-gray-800 mt-1">{rejectedProjects}</h3>
          </div>
          <div className="p-2.5 bg-red-50 text-red-500 rounded">
             <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Header Target Box */}
      <div className="bg-white p-5 rounded border border-gray-200 flex flex-col items-start gap-4">
        <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400"/>
            Search Projects
        </h2>
        <div className="flex flex-col md:flex-row gap-3 w-full items-center">
            <div className="relative w-full md:flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                  type="text"
                  placeholder="Search by project title or student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 shrink-0">
               <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2.5 text-sm border border-gray-300 rounded bg-white text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
               >
                  <option value="all">Filter Status: All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in-progress">In-Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
               </select>
               <select 
                  value={supervisorFilter}
                  onChange={(e) => setSupervisorFilter(e.target.value)}
                  className="w-full sm:w-56 px-3 py-2.5 text-sm border border-gray-300 rounded bg-white text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
               >
                  <option value="all">Filter Supervisor: All</option>
                  {uniqueSupervisors.map((name, i) => (
                      <option key={i} value={name}>{name}</option>
                  ))}
               </select>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 border border-gray-200 rounded bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
             <h2 className="text-base font-semibold text-gray-700">Projects Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="py-3 px-5 text-[13px] font-semibold text-gray-600">Project Details</th>
                  <th className="py-3 px-5 text-[13px] font-semibold text-gray-600">Student</th>
                  <th className="py-3 px-5 text-[13px] font-semibold text-gray-600">Supervisor</th>
                  <th className="py-3 px-5 text-[13px] font-semibold text-gray-600">Deadline</th>
                  <th className="py-3 px-5 text-[13px] font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-5 text-[13px] font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.length > 0 ? filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5 align-top max-w-xs">
                        <div className="min-w-0">
                           <span className="text-sm font-medium text-gray-800 block mb-1">{project.title || "Untitled Project"}</span>
                           <span className="text-[13px] text-gray-500 block line-clamp-2">{project.description || "No description provided."}</span>
                        </div>
                    </td>
                    <td className="py-4 px-5 align-top">
                        <p className="text-sm font-medium text-gray-800">{project.student?.name || "Unknown"}</p>
                    </td>
                    <td className="py-4 px-5 align-top">
                        {project.supervisor?.name ? (
                            <span className="inline-block px-2.5 py-1 text-[13px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded">
                                {project.supervisor.name}
                            </span>
                        ) : (
                            <span className="inline-block px-2.5 py-1 text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 rounded">
                                Unassigned
                            </span>
                        )}
                    </td>
                    <td className="py-4 px-5 align-top">
                        <span className="text-sm text-gray-700">
                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}
                        </span>
                    </td>
                    <td className="py-4 px-5 align-top">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          project.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' : 
                          project.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' :
                          project.status?.toLowerCase() === 'approved' ? 'bg-blue-100 text-blue-700' :
                          project.status?.toLowerCase() === 'in-progress' ? 'bg-purple-100 text-purple-700' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status || "Pending"}
                        </span>
                    </td>
                    <td className="py-4 px-5 align-top text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap min-w-[200px]">
                            <button
                              onClick={() => setViewedProject(project)}
                              className="px-3 py-1.5 text-[13px] font-medium bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              View
                            </button>
                            
                            {(project.status?.toLowerCase() === "pending" || !project.status) ? (
                                <>
                                  <button
                                    onClick={() => handleAction(project._id, "approve")}
                                    disabled={actionLoading?.id === project._id}
                                    className="px-3 py-1.5 text-[13px] font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center disabled:opacity-60"
                                  >
                                    {actionLoading?.id === project._id && actionLoading?.action === "approve" && (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                    )}
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleAction(project._id, "reject")}
                                    disabled={actionLoading?.id === project._id}
                                    className="px-3 py-1.5 text-[13px] font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center disabled:opacity-60"
                                  >
                                    {actionLoading?.id === project._id && actionLoading?.action === "reject" && (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                    )}
                                    Reject
                                  </button>
                                </>
                            ) : (
                                <span className="text-[13px] text-gray-400 italic px-2 py-1 bg-gray-50 border border-gray-200 rounded">Processed</span>
                            )}
                          </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                      <td colSpan="6" className="py-8 text-center">
                          <p className="text-gray-500 text-sm">No projects found matching criteria.</p>
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4" onClick={() => setViewedProject(null)}>
           <div className="bg-white rounded w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-lg" onClick={e => e.stopPropagation()}>
               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                   <h2 className="text-lg font-semibold text-gray-800">Project Details</h2>
                   <button onClick={() => setViewedProject(null)} className="text-gray-400 hover:text-gray-600">
                       <X className="w-5 h-5"/>
                   </button>
               </div>
               
               <div className="p-6 overflow-y-auto w-full flex-1 space-y-6">
                   <div>
                       <h3 className="text-[13px] font-semibold text-gray-500 mb-1">Title</h3>
                       <p className="text-base text-gray-800">{viewedProject.title}</p>
                   </div>
                   
                   <div>
                       <h3 className="text-[13px] font-semibold text-gray-500 mb-1">Description</h3>
                       <div className="p-3 bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded whitespace-pre-wrap">
                           {viewedProject.description || "No description provided."}
                       </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-2">
                       <div>
                          <h3 className="text-[13px] font-semibold text-gray-500 mb-1">Student Info</h3>
                          <p className="text-sm text-gray-800">{viewedProject.student?.name || "Unknown"}</p>
                       </div>
                       <div>
                          <h3 className="text-[13px] font-semibold text-gray-500 mb-1">Supervisor Info</h3>
                          <p className="text-sm text-gray-800">{viewedProject.supervisor?.name || "Unassigned"}</p>
                       </div>
                       <div>
                          <h3 className="text-[13px] font-semibold text-gray-500 mb-1">Deadline</h3>
                          <p className="text-sm text-gray-800">{viewedProject.deadline ? new Date(viewedProject.deadline).toLocaleDateString() : "N/A"}</p>
                       </div>
                       <div>
                          <h3 className="text-[13px] font-semibold text-gray-500 mb-1">Status</h3>
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                              viewedProject.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' : 
                              viewedProject.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' :
                              viewedProject.status?.toLowerCase() === 'approved' ? 'bg-blue-100 text-blue-700' :
                              viewedProject.status?.toLowerCase() === 'in-progress' ? 'bg-purple-100 text-purple-700' :
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                              {viewedProject.status || "Pending"}
                          </span>
                       </div>
                   </div>

                   {viewedProject.files && viewedProject.files.length > 0 && (
                       <div className="border-t border-gray-100 pt-4">
                           <h3 className="text-[13px] font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                               <FileText className="w-4 h-4" /> 
                               Attached Files ({viewedProject.files.length})
                           </h3>
                           <div className="flex flex-col gap-2 pl-1">
                               {viewedProject.files.map((file, idx) => (
                                   <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                       <span className="truncate" title={file.originalName}>{file.originalName || "Unnamed File"}</span>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}
               </div>

               <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                   <button onClick={() => setViewedProject(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                       Close
                   </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
