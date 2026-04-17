import { useEffect, useState } from "react";
import { Users, Loader2, Save, UserCog, Search, UserCheck, UserX, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

const AssignSupervisor = () => {
  const [projects, setProjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [selections, setSelections] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'assigned' | 'unassigned'

  const fetchData = async () => {
    try {
      const projRes = await axiosInstance.get("/admin/projects");
      const teachRes = await axiosInstance.get("/admin/users");
      
      const fetchedProjects = projRes.data?.data?.projects || [];
      const allUsers = Array.isArray(teachRes.data?.data) ? teachRes.data.data : (teachRes.data?.data?.users || []);
      const professors = allUsers.filter(u => u.role?.toLowerCase() === "professor");

      setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []);
      setTeachers(professors);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (project) => {
    let supervisorId = selections[project._id];
    if (!supervisorId && project.supervisor) {
        supervisorId = typeof project.supervisor === 'string' ? project.supervisor : project.supervisor._id;
    }

    const studentId = project.student?._id;
    
    if (!supervisorId) return toast.error("Please select a supervisor first");
    if (!studentId) return toast.error("Cannot assign: Project is missing a valid student ID");
    
    setSavingId(project._id);
    try {
      await axiosInstance.post("/admin/assign-supervisor", { studentId, supervisorId });
      toast.success("Supervisor assigned successfully");
      fetchData(); // Refresh to reflect assigned status
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign supervisor");
    } finally {
      setSavingId(null);
    }
  };

  const handleSelect = (projectId, val) => {
    setSelections({ ...selections, [projectId]: val });
  };

  // Safe string getter
  const safeString = (str) => typeof str === 'string' ? str.toLowerCase() : '';

  // Highly robust truthy evaluation since MongoDB population can sometimes return empty objects
  const isProjectAssigned = (p) => !!p.supervisor?._id || (typeof p.supervisor === 'string' && p.supervisor.trim().length > 0);

  // Apply filters to projects
  // We map all projects because admins should have visibility on the entire queue
  const filteredProjects = projects.filter((p) => {
    const assigned = isProjectAssigned(p);

    // 1. Status Match 
    if (filterStatus === "unassigned" && assigned) return false;
    if (filterStatus === "assigned" && !assigned) return false;

    // 3. Search Match
    const searchLow = searchTerm.toLowerCase();
    const studentName = safeString(p.student?.name);
    const projTitle = safeString(p.title);
    
    if (searchLow && !studentName.includes(searchLow) && !projTitle.includes(searchLow)) {
      return false;
    }
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-US", { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 flex items-center">
          <UserCog className="w-6 h-6 mr-3 text-slate-600" />
          Assign Supervisor
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage supervisor assignments for students and projects</p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Assign Students</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">
              {projects.filter(p => isProjectAssigned(p)).length}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Unassigned Students</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">
              {projects.filter(p => !isProjectAssigned(p)).length}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Available Teachers</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">
              {teachers.filter(t => (t.maxStudents || 10) - (t.assignedStudents?.length || 0) > 0).length}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserPlus className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Dynamic Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Box */}
        <div className="relative w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex items-center">
          <Search className="w-5 h-5 absolute left-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 focus:outline-none focus:ring-0 text-sm text-slate-700 bg-transparent"
          />
        </div>

        {/* Filter Status Box */}
        <div className="flex items-center justify-between gap-3 px-5 py-2 w-full bg-white border border-slate-200 rounded-xl shadow-sm">
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1.5 px-3 border border-slate-100 bg-slate-50/50 rounded-lg focus:ring-0 text-sm focus:outline-none min-w-[160px] text-slate-700 font-medium"
          >
            <option value="all">All Projects</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4">
        {/* Table Title Block from Screenshot */}
        <div className="px-5 py-4 border-b border-slate-200 bg-white sm:flex sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-slate-800">Student assignments</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs">
                  <th className="p-4 font-semibold">Student</th>
                  <th className="p-4 font-semibold">Project Title</th>
                  <th className="p-4 font-semibold">Supervisor</th>
                  <th className="p-4 font-semibold">Deadline</th>
                  <th className="p-4 font-semibold text-left">Updated</th>
                  <th className="p-4 font-semibold text-left">Assign supervisor</th>
                  <th className="p-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => {
                  const isAssigned = isProjectAssigned(project);
                  return (
                    <tr key={project._id} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{project.student?.name || "Unknown"}</p>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="font-semibold text-slate-700 truncate" title={project.title}>{project.title || "Untitled"}</p>
                      </td>
                      <td className="p-4">
                        {isAssigned ? (
                           <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-medium text-xs border border-indigo-100 inline-flex items-center">
                              {project.supervisor?.name || "Assigned"}
                           </span>
                        ) : (
                           <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md font-medium text-xs border border-rose-100">
                              Not Assigned
                           </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600">{formatDate(project.deadline)}</td>
                      <td className="p-4 text-slate-600">{formatDateTime(project.updatedAt || project.createdAt)}</td>
                      
                      <td className="p-4">
                        <select
                          value={selections[project._id] || (isAssigned ? (typeof project.supervisor === 'string' ? project.supervisor : project.supervisor?._id) : "")}
                          onChange={(e) => handleSelect(project._id, e.target.value)}
                          className="w-full p-2.5 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-medium"
                        >
                          <option value="" disabled>Select professor</option>
                          {teachers.map(t => {
                            const max = t.maxStudents || 10;
                            const assigned = t.assignedStudents?.length || 0;
                            const remaining = Math.max(0, max - assigned);
                            const isFull = remaining <= 0;
                            return (
                              <option key={t._id} value={t._id} disabled={isFull}>
                                {t.name} {isFull ? "(Full)" : `(${remaining} slots left)`}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="p-4 text-center">
                          <button
                            onClick={() => handleAssign(project)}
                            disabled={savingId === project._id || (!selections[project._id] && !isAssigned)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full shadow-sm"
                          >
                            {savingId === project._id ? <Loader2 className="w-4 h-4 animate-spin" /> : isAssigned ? "Assigned" : "Assign"}
                          </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Users className="w-12 h-12 text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">No Projects Found</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">No approved projects match your current search and filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignSupervisor;
