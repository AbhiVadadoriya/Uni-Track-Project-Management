import { useState, useEffect } from "react";
import { MessageSquare, Loader2, Users, FileText, CheckCircle, Clock, Check, FolderKanban, Activity, X } from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

const AssignedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  // Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("positive");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const fetchAssigned = async () => {
    try {
      const res = await axiosInstance.get("/professor/assigned-students");
      setStudents(res.data.data?.students || res.data.assignedStudents || []);
    } catch (error) {
      toast.error("Failed to load assigned students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const handleMarkComplete = async (projectId) => {
    if (!projectId) return toast.error("No active project to complete.");
    try {
      setCompletingId(projectId);
      await axiosInstance.post(`/professor/mark-complete/${projectId}`);
      toast.success("Project marked as complete successfully!");
      setStudents((prev) =>
        prev.map((s) =>
          s.project?._id === projectId ? { ...s, project: { ...s.project, status: "completed" } } : s
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark complete.");
    } finally {
      setCompletingId(null);
    }
  };

  const openFeedbackModal = (project) => {
    if (!project) return toast.error("This student has no active project yet.");
    setActiveProject(project);
    setFeedbackTitle("");
    setFeedbackMessage("");
    setFeedbackType("positive");
    setFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackMessage.trim()) return toast.error("Title and message are required.");
    
    try {
      setFeedbackLoading(true);
      await axiosInstance.post(`/professor/feedback/${activeProject._id}`, {
        title: feedbackTitle,
        message: feedbackMessage,
        type: feedbackType,
      });
      toast.success("Feedback submitted successfully!");
      setFeedbackModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Metrics Logic
  const totalStudents = students.length;
  const projectsCompleted = students.filter((s) => s.project?.status?.toLowerCase() === "completed").length;
  const inProgress = students.filter(
    (s) => s.project && s.project.status?.toLowerCase() !== "completed" && s.project.status?.toLowerCase() !== "rejected"
  ).length;
  const totalProjects = students.filter((s) => s.project).length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 font-sans relative text-gray-800">
      
      {/* Header Container */}
      <div className="bg-white p-6 rounded border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">Assign Students</h1>
          <p className="text-[13px] text-gray-500 mt-1">Manage your assigned students and their projects</p>
        </div>
      </div>

      {/* 4 Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Total Students</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{totalStudents}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-500 rounded">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div>
             <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Projects Completed</p>
             <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{projectsCompleted}</h3>
          </div>
          <div className="p-2.5 bg-green-50 text-green-500 rounded">
             <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div>
             <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">In Progress</p>
             <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{inProgress}</h3>
          </div>
          <div className="p-2.5 bg-yellow-50 text-yellow-500 rounded">
             <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div>
             <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Total Projects</p>
             <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{totalProjects}</h3>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-500 rounded">
             <FolderKanban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center h-48 border border-gray-200 rounded bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : students.length > 0 ? (
        <div className="space-y-4">
          {students.map((student) => (
            <div key={student._id} className="bg-white rounded border border-gray-200 p-6 flex flex-col lg:flex-row justify-between lg:items-center gap-5 hover:border-gray-300 transition-colors">
               
               {/* Left Side - Info & Actions */}
               <div className="flex flex-col shrink-0 lg:max-w-2xl">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-[14px] shrink-0">
                       {student.name?.charAt(0) || "S"}
                     </div>
                     <div>
                       <h3 className="text-[15px] font-bold text-gray-800 tracking-tight leading-tight">{student.name}</h3>
                       <p className="text-[12px] text-gray-500 font-medium mt-0.5">{student.email}</p>
                     </div>
                  </div>
                  
                  <div className="mt-3 bg-gray-50/50 p-3 rounded border border-gray-100">
                     <p className="text-[13px] font-bold text-gray-700 flex items-center gap-2 tracking-tight">
                         <FileText className="w-3.5 h-3.5 text-gray-400" />
                         Project Area: <span className="text-gray-900 font-extrabold">{student.project?.title || "No assigned project"}</span>
                     </p>
                     <p className="text-[11px] text-gray-500 font-medium mt-1.5 flex items-center gap-2">
                         <Clock className="w-3.5 h-3.5" />
                         Last Updated: {student.project?.updatedAt ? new Date(student.project.updatedAt).toLocaleDateString() : "N/A"}
                     </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                     <button
                        onClick={() => openFeedbackModal(student.project)}
                        disabled={!student.project}
                        className="px-4 py-2 text-[12px] font-bold bg-blue-600 text-white border border-transparent rounded hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 tracking-wide"
                     >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        Feedback
                     </button>
                     <button
                        onClick={() => handleMarkComplete(student.project?._id)}
                        disabled={!student.project || completingId === student.project?._id || student.project?.status?.toLowerCase() === "completed"}
                        className="px-4 py-2 text-[12px] font-bold bg-green-600 text-white border border-transparent rounded hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 tracking-wide"
                     >
                        {completingId === student.project?._id ? (
                           <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                           <Check className="w-3.5 h-3.5 mr-1.5 stroke-[3px]" />
                        )}
                        Mark Complete
                     </button>
                  </div>
               </div>

               {/* Right Side - Status */}
               <div className="lg:w-48 flex lg:justify-end items-start h-full mt-2 lg:mt-0">
                  <div className="flex flex-col gap-1 items-start lg:items-end w-full">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Current Status</span>
                      <span className={`inline-block px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase rounded border ${
                        student.project?.status?.toLowerCase() === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                        student.project?.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        student.project?.status?.toLowerCase() === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        !student.project ? 'bg-gray-50 text-gray-500 border-gray-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {student.project?.status || "Unassigned"}
                      </span>
                  </div>
               </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded p-16 text-center">
          <Users className="w-12 h-12 text-gray-300 mb-4" />
          <h2 className="text-[17px] font-bold text-gray-800">No Assigned Students</h2>
          <p className="text-gray-500 mt-2 max-w-sm text-[13px] font-medium">You currently do not have any students assigned to your supervision.</p>
        </div>
      )}

      {/* Feedback Modal Overlay */}
      {feedbackModal && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4" onClick={() => setFeedbackModal(false)}>
           <div className="bg-white rounded w-full max-w-md overflow-hidden flex flex-col shadow-lg border border-gray-200" onClick={e => e.stopPropagation()}>
               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                   <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                       <MessageSquare className="w-4 h-4" /> Give Feedback
                   </h2>
                   <button onClick={() => setFeedbackModal(false)} className="text-gray-400 hover:text-gray-600">
                       <X className="w-5 h-5"/>
                   </button>
               </div>
               
               <form onSubmit={handleFeedbackSubmit} className="p-6 flex flex-col gap-4">
                   <div>
                       <label className="block text-[13px] font-bold text-gray-700 mb-1">Feedback Title</label>
                       <input 
                          type="text" 
                          required
                          value={feedbackTitle}
                          onChange={e => setFeedbackTitle(e.target.value)}
                          placeholder="e.g. Project Title"
                          className="w-full px-3 py-2 text-[13px] font-medium border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-gray-800"
                       />
                   </div>
                   
                   <div>
                       <label className="block text-[13px] font-bold text-gray-700 mb-1">Feedback Message</label>
                       <textarea 
                          rows="4"
                          required
                          value={feedbackMessage}
                          onChange={e => setFeedbackMessage(e.target.value)}
                          placeholder="Write your detailed feedback here..."
                          className="w-full px-3 py-2 text-[13px] font-medium border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-gray-800 resize-none"
                       />
                   </div>

                   <div>
                       <label className="block text-[13px] font-bold text-gray-700 mb-1">Feedback Type</label>
                       <select 
                          value={feedbackType}
                          onChange={e => setFeedbackType(e.target.value)}
                          className="w-full px-3 py-2 text-[13px] font-medium border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-gray-700 cursor-pointer"
                       >
                           <option value="positive">Positive</option>
                           <option value="negative">Needs Revision</option>
                           <option value="neutral">Neutral</option>
                       </select>
                   </div>

                   <button 
                      type="submit" 
                      disabled={feedbackLoading}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] py-2.5 rounded transition-colors flex justify-center items-center"
                   >
                     {feedbackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Feedback"}
                   </button>
               </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default AssignedStudents;
