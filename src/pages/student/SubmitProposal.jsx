import { useState } from "react";
import { useDispatch } from "react-redux";
import { Send, Loader2, Info } from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";
import { fetchStudentProject } from "../../store/slices/studentSlice";
import { useNavigate } from "react-router-dom";

const SubmitProposal = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    teamMembers: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/student/project-proposal", {
        ...formData,
        technologies: formData.technologies.split(",").map((t) => t.trim()),
        teamMembers: formData.teamMembers.split(",").map((m) => m.trim()),
      });
      toast.success("Proposal submitted successfully!");
      dispatch(fetchStudentProject());
      navigate("/student/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Block (Flat Corporate) */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Submit Project Proposal</h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide a detailed description of your intended Uni Track Project Management. Once approved, this will become your active tracked project.
        </p>
      </div>

      {/* Guidelines Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-0.5">Review Guidelines</p>
          <p className="opacity-90 leading-relaxed">Your proposal must include modern, relevant technologies. Supervisors will review the scope and depth before granting approval.</p>
        </div>
      </div>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="space-y-5">
          
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Project Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2.5 text-sm border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              placeholder="E.g., Automated Health Diagnostics AI"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Detailed Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-2.5 text-sm border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
              placeholder="Explain the problem statement, objectives, and proposed solution..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Technologies (comma separated)</label>
              <input
                type="text"
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                required
                className="w-full p-2.5 text-sm border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                placeholder="React, Node.js, MongoDB, Python"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Team Members (IDs/Emails, comma separated)</label>
              <input
                type="text"
                name="teamMembers"
                value={formData.teamMembers}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                placeholder="Leave blank if solo"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-bold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? "Submitting..." : "Submit Proposal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitProposal;
