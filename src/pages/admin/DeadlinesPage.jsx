import { useEffect, useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

const DeadlinesPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ projectId: "", name: "", dueDate: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get("/admin/projects");
      const fetchedProjects = res.data?.data?.projects || res.data?.projects || [];
      setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []);
    } catch (error) {
      toast.error("Failed to load projects data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateDeadline = async (e) => {
    e.preventDefault();
    if (!formData.projectId || !formData.name || !formData.dueDate) {
        return toast.error("Please fill in all deadline fields");
    }

    setActionLoading(true);
    try {
      // Connects cleanly to the backend Deadline initialization and hooks it to Project internally
      await axiosInstance.post(`/deadline/create-deadline/${formData.projectId}`, {
          name: formData.name,
          dueDate: formData.dueDate
      });
      
      toast.success("Deadline firmly applied to project!");
      setFormData({ projectId: "", name: "", dueDate: "" });
      setIsModalOpen(false);
      
      // Refresh the table smoothly
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to establish deadline");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.student?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 font-sans relative text-gray-800">
      
      {/* Top Header Box */}
      <div className="bg-white p-6 rounded border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 flex items-center">
            Manage Deadlines
          </h1>
          <p className="text-sm text-gray-500 mt-1 cursor-default">Create and monitor project deadlines</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
        >
          Create/Update deadline
        </button>
      </div>

      {/* Search Header Box */}
      <div className="bg-white p-5 rounded border border-gray-200 flex flex-col items-start gap-4">
        <h2 className="text-base font-semibold text-gray-700">
            Search deadlines
        </h2>
        <div className="relative w-full md:w-1/2">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
                type="text"
                placeholder="Search by project or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            />
        </div>
      </div>

      {/* Table Box */}
      {loading ? (
        <div className="flex justify-center items-center h-48 border border-gray-200 rounded bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
             <h2 className="text-base font-semibold text-gray-700">Project Deadlines</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="py-3 px-5 text-[13px] font-semibold text-gray-600">Student</th>
                  <th className="py-3 px-5 text-[13px] font-semibold text-gray-600">Project Title</th>
                  <th className="py-3 px-5 text-[13px] font-semibold text-gray-600">Supervisor</th>
                  <th className="py-3 px-5 text-[13px] font-semibold text-gray-600">Deadline</th>
                  <th className="py-3 px-5 text-[13px] font-semibold text-gray-600">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.length > 0 ? filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5 align-top">
                        <p className="text-sm font-medium text-gray-800">{project.student?.name || "Unknown"}</p>
                    </td>
                    <td className="py-4 px-5 align-top max-w-xs">
                        <span className="text-sm text-blue-600 font-medium block truncate" title={project.title}>
                            {project.title || "Untitled Project"}
                        </span>
                    </td>
                    <td className="py-4 px-5 align-top">
                        {project.supervisor?.name ? (
                            <span className="inline-block px-2.5 py-1 text-[13px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded">
                                {project.supervisor.name}
                            </span>
                        ) : (
                            <span className="text-[13px] font-medium text-gray-500">Unassigned</span>
                        )}
                    </td>
                    <td className="py-4 px-5 align-top">
                        <span className={`text-sm font-medium ${project.deadline ? 'text-red-500' : 'text-gray-500'}`}>
                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}
                        </span>
                    </td>
                    <td className="py-4 px-5 align-top">
                        <span className="text-[13px] text-gray-600">
                            {new Date(project.updatedAt || project.createdAt).toLocaleString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500 text-sm">
                          No projects tracked in the system.
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4" onClick={() => setIsModalOpen(false)}>
           <div className="bg-white rounded w-full max-w-md overflow-hidden flex flex-col shadow-lg" onClick={e => e.stopPropagation()}>
               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                   <h2 className="text-lg font-semibold text-gray-800">Set Project Deadline</h2>
                   <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                       <X className="w-5 h-5"/>
                   </button>
               </div>
               
               <form onSubmit={handleCreateDeadline} className="p-6 space-y-5">
                   <div>
                       <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Target Project</label>
                       <select 
                           value={formData.projectId}
                           onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                           required
                           className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-800"
                       >
                           <option value="" disabled>Select an approved project...</option>
                           {projects.map(p => (
                               <option key={p._id} value={p._id}>
                                   {p.title} ({p.student?.name || "Unknown"}) - {p.status || "Pending"}
                               </option>
                           ))}
                       </select>
                   </div>
                   
                   <div>
                       <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Deadline Title / Description</label>
                       <input 
                           type="text"
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           required
                           placeholder="e.g. Final Software Documentation"
                           className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                       />
                   </div>

                   <div>
                       <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Due Date</label>
                       <input 
                           type="date"
                           value={formData.dueDate}
                           onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                           required
                           className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                       />
                   </div>

                   <div className="pt-2 flex justify-end gap-3">
                       <button 
                           type="button" 
                           onClick={() => setIsModalOpen(false)}
                           className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                       >
                           Cancel
                       </button>
                       <button 
                           type="submit" 
                           disabled={actionLoading}
                           className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center disabled:opacity-70"
                       >
                           {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                           Save Deadline
                       </button>
                   </div>
               </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default DeadlinesPage;
