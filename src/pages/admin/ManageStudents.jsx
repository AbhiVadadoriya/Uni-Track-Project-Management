import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Users, Search, GraduationCap, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", department: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        axiosInstance.get("/admin/users"),
        axiosInstance.get("/admin/projects")
      ]);
      const allUsers = Array.isArray(usersRes.data?.data) ? usersRes.data.data : (usersRes.data?.data?.users || []);
      const allProjects = projectsRes.data?.data?.projects || [];

      const studentUsers = allUsers.filter(u => u.role?.toLowerCase() === "student");
      
      const mappedStudents = studentUsers.map(student => {
          const project = allProjects.find(p => p.student?._id === student._id);
          return {
             ...student,
             projectTitle: project ? project.title : "No Active Project",
             status: project ? project.status.toLowerCase() : "unassigned",
             supervisor: project?.supervisor?.name || "Pending Validation"
          };
      });
      setStudents(mappedStudents);
    } catch (error) {
      toast.error("Failed to load students mapping");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Do not send empty password if updating
      
      if (editingId) {
        await axiosInstance.put(`/admin/update-student/${editingId}`, payload);
        toast.success("Student updated successfully");
      } else {
        await axiosInstance.post("/admin/create-student", payload);
        toast.success("Student created successfully");
      }
      setFormData({ name: "", email: "", password: "", department: "" });
      setEditingId(null);
      setIsAdding(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'add'} student`);
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (student) => {
    setFormData({ 
      name: student.name, 
      email: student.email, 
      password: "", // Clear password to ensure we don't send their hash back
      department: student.department || "" 
    });
    setEditingId(student._id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this student?")) return;
    try {
      await axiosInstance.delete(`/admin/delete-student/${id}`);
      setStudents(students.filter((s) => s._id !== id));
      toast.success("Student removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student");
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.email?.toLowerCase().includes(searchTerm.toLowerCase()) || s.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesDept = deptFilter === "all" || (s.department && s.department.toLowerCase() === deptFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesDept;
  });

  const uniqueDepts = Array.from(new Set(students.map(s => s.department).filter(Boolean)));
  const totalStudents = students.length;
  const completeProjects = students.filter(s => s.status === 'completed').length;
  const unassignedStudents = students.filter(s => s.status === 'unassigned').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Student</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalStudents}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Complete Project</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{completeProjects}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Unassigned</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{unassignedStudents}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Manage Students
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review student project allocations across departments.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto flex-wrap">
          <div className="relative md:w-56">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search students or projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 py-2 text-sm border border-slate-200 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all text-slate-700"
            />
          </div>
          <select 
            className="p-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="approved">Active</option>
            <option value="pending">Pending Validation</option>
            <option value="unassigned">Unassigned</option>
          </select>
          <select 
            className="p-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-none"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {uniqueDepts.map((d, i) => <option key={i} value={d}>{d}</option>)}
          </select>

          <button
            onClick={() => {
              setIsAdding(!isAdding);
              if (isAdding) { setEditingId(null); setFormData({ name: "", email: "", password: "", department: "" }); }
            }}
            className="bg-blue-600 text-white px-5 py-2.5 text-sm rounded-xl font-semibold flex items-center hover:bg-blue-700 transition duration-200 shadow-sm"
          >
            {isAdding ? <Users className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2 text-white/80" />}
            {isAdding ? "Cancel" : "Add Student"}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-200">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">{editingId ? "Edit Student Profile" : "Register New Student"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 text-sm border border-slate-200 rounded-md focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all text-slate-700"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700"
                placeholder="john@example.edu"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Password {editingId && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}</label>
              <input
                type="password"
                required={!editingId}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700"
                placeholder="Computer Science"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={actionLoading}
              className="bg-slate-900 text-white px-6 py-2 text-sm rounded-md font-medium flex items-center hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Save Changes" : "Create Account"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-4 px-6 font-semibold text-sm text-slate-500">Student Info</th>
                  <th className="py-4 px-6 font-semibold text-sm text-slate-500">Dept & Year</th>
                  <th className="py-4 px-6 font-semibold text-sm text-slate-500">Supervisor</th>
                  <th className="py-4 px-6 font-semibold text-sm text-slate-500">Project Title</th>
                  <th className="py-4 px-6 font-semibold text-sm text-slate-500">Status</th>
                  <th className="py-4 px-6 font-semibold text-sm text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-700 text-sm">{student.department || "N/A"}</p>
                      <p className="text-xs text-slate-500">Uni Track Project Management</p>
                    </td>
                    <td className="py-4 px-6">
                        <span className="text-sm font-medium text-slate-600">{student.supervisor}</span>
                    </td>
                    <td className="py-4 px-6">
                        <span className="text-sm text-slate-700 font-medium truncate shrink max-w-[200px] block">{student.projectTitle}</span>
                    </td>
                    <td className="py-4 px-6">
                       <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                          student.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                          student.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          student.status === 'unassigned' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                       }`}>
                          {student.status.toUpperCase()}
                       </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => startEdit(student)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white border border-slate-100 shadow-sm rounded-3xl p-16 text-center">
          <Users className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">No Students Found</h2>
          <p className="text-slate-500 mt-2 max-w-sm">No student accounts match your search or exist in the system.</p>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
