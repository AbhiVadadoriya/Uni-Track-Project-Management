import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Search, UserCircle } from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", department: "", maxStudents: 5, expertise: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeachers = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        axiosInstance.get("/admin/users"),
        axiosInstance.get("/admin/projects")
      ]);
      const allUsers = Array.isArray(usersRes.data?.data) ? usersRes.data.data : (usersRes.data?.data?.users || []);
      const allProjects = projectsRes.data?.data?.projects || [];

      const professorUsers = allUsers.filter(u => u.role?.toLowerCase() === "professor");

      const mappedTeachers = professorUsers.map(teacher => {
          const assignedProjects = allProjects.filter(p => p.supervisor?._id === teacher._id);
          return {
             ...teacher,
             assignedCount: assignedProjects.length,
             activeProjects: assignedProjects.map(p => p.title)
          };
      });

      setTeachers(mappedTeachers);
    } catch (error) {
      toast.error("Failed to load teachers mapping");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      if (editingId) {
        await axiosInstance.put(`/admin/update-professor/${editingId}`, payload);
        toast.success("Professor updated successfully");
      } else {
        await axiosInstance.post("/admin/create-professor", payload);
        toast.success("Professor created successfully");
      }
      setFormData({ name: "", email: "", password: "", department: "", maxStudents: 5, expertise: "" });
      setEditingId(null);
      setIsAdding(false);
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'add'} professor`);
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (teacher) => {
    setFormData({ 
      name: teacher.name, 
      email: teacher.email, 
      password: "", // Avoid overriding the hashed password via UI blank fields
      department: teacher.department || "",
      maxStudents: teacher.maxStudents || 5,
      expertise: Array.isArray(teacher.expertise) ? teacher.expertise.join(", ") : teacher.expertise || ""
    });
    setEditingId(teacher._id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this professor?")) return;
    try {
      await axiosInstance.delete(`/admin/delete-professor/${id}`);
      setTeachers(teachers.filter((t) => t._id !== id));
      toast.success("Professor removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete professor");
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || t.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "all" || (t.department && t.department.toLowerCase() === deptFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const uniqueDepts = Array.from(new Set(teachers.map(t => t.department).filter(Boolean)));
  const totalProfessors = teachers.length;
  const totalSupervising = teachers.reduce((acc, curr) => acc + (curr.assignedCount || 0), 0);
  const totalCapacity = teachers.reduce((acc, curr) => acc + (curr.maxStudents || 5), 0);
  const availableSlots = totalCapacity - totalSupervising;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Professor</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalProfessors}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <UserCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Active Allocations</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalSupervising}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <UserCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Available Slots</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{availableSlots}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Manage Professors
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review supervisor metrics and dynamic workload limits.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto flex-wrap">
          <div className="relative md:w-56">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search professors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 py-2 text-sm border border-slate-200 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all text-slate-700"
            />
          </div>
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
              if (isAdding) { setEditingId(null); setFormData({ name: "", email: "", password: "", department: "", maxStudents: 5, expertise: "" }); }
            }}
            className="bg-purple-600 text-white px-5 py-2.5 text-sm rounded-xl font-semibold flex items-center hover:bg-purple-700 transition duration-200 shadow-sm"
          >
            {isAdding ? <UserCircle className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2 text-white/80" />}
            {isAdding ? "Cancel" : "Add Professor"}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-200">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">{editingId ? "Edit Professor Profile" : "Register New Professor"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 text-sm border border-slate-200 rounded-md focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all text-slate-700"
                placeholder="Dr. Alan Turing"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-purple-500 focus:ring-purple-500 focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700"
                placeholder="alan@example.edu"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Password {editingId && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}</label>
              <input
                type="password"
                required={!editingId}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-purple-500 focus:ring-purple-500 focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700"
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
                className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-purple-500 focus:ring-purple-500 focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700"
                placeholder="Mathematics"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Max Students Capacity</label>
              <input
                type="number"
                min="1"
                required
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-purple-500 focus:ring-purple-500 focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Expertise (Comma separated)</label>
              <input
                type="text"
                required
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl focus:border-purple-500 focus:ring-purple-500 focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700"
                placeholder="AI, Machine Learning, Robotics"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={actionLoading}
              className="bg-slate-900 text-white px-6 py-2 text-sm rounded-md font-medium flex items-center hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Save Changes" : "Create Professor"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      ) : filteredTeachers.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-4 px-6 font-semibold text-sm text-slate-500">Professor Info</th>
                  <th className="py-4 px-6 font-semibold text-sm text-slate-500">Dept & Expertise</th>
                  <th className="py-4 px-6 font-semibold text-sm text-slate-500 text-center">Workload (Load/Max)</th>
                  <th className="py-4 px-6 font-semibold text-sm text-slate-500">Active Supervision</th>
                  <th className="py-4 px-6 font-semibold text-sm text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((teacher) => {
                  const capacityRatio = teacher.assignedCount / (teacher.maxStudents || 5);
                  let badgeColor = "bg-emerald-100 text-emerald-700";
                  if (capacityRatio >= 1) badgeColor = "bg-red-100 text-red-700";
                  else if (capacityRatio >= 0.7) badgeColor = "bg-amber-100 text-amber-700";

                  return (
                  <tr key={teacher._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                          {teacher.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{teacher.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{teacher.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-700 text-sm mb-1">{teacher.department || "N/A"}</p>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {teacher.expertise?.map((exp, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded uppercase font-semibold tracking-wide">{exp}</span>
                        )) || <span className="text-slate-500 text-xs">None listed</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${badgeColor}`}>
                           {teacher.assignedCount} / {teacher.maxStudents || 5}
                        </span>
                    </td>
                    <td className="py-4 px-6">
                        <span className="text-xs text-slate-500 font-medium line-clamp-2 max-w-[250px]">
                           {teacher.activeProjects.length > 0 ? teacher.activeProjects.join(", ") : "No active projects"}
                        </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => startEdit(teacher)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Professor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                 )})}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white border border-slate-100 shadow-sm rounded-3xl p-16 text-center">
          <UserCircle className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">No Professors Found</h2>
          <p className="text-slate-500 mt-2 max-w-sm">No professor accounts match your search or exist in the system.</p>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;
