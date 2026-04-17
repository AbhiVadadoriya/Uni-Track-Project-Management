import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { MessageSquare, AlertCircle, Loader2, Clock, ThumbsUp } from "lucide-react";
import { axiosInstance } from "../../lib/axios";

const FeedbackPage = () => {
  const { project } = useSelector((state) => state.student);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!project?._id) {
        setLoading(false);
        return;
      }
      try {
        const res = await axiosInstance.get(`/student/feedback/${project._id}`);
        setFeedback(res.data.data.feedback || []);
      } catch (error) {
        setFeedback([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [project?._id]);

  if (!project) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-5 font-sans relative text-gray-800">
        <div className="bg-white border border-gray-200 rounded p-12 flex flex-col items-center justify-center text-center mt-5">
          <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
          <h2 className="text-lg font-bold text-gray-800 mb-1">No Active Project</h2>
          <p className="text-[14px] font-medium text-gray-500">You need an active project to view feedback. Please submit a proposal first.</p>
        </div>
      </div>
    );
  }

  const positiveCount = feedback.filter(f => f.type === 'positive' || (f.title && f.title.toLowerCase().includes('good'))).length;
  const revisionCount = feedback.filter(f => f.type === 'negative' || f.type === 'general').length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 font-sans relative text-gray-800">
      
      {/* Header */}
      <div className="bg-white p-6 rounded border border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Supervisor Feedback</h1>
        <p className="text-[13px] text-gray-500 mt-1">View feedback and comments from your supervisor</p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <p className="text-[13px] font-semibold text-gray-500 tracking-wide uppercase">Total Feedback</p>
            <h3 className="text-xl font-bold text-gray-800 truncate mt-1">{feedback.length}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-500 rounded shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <p className="text-[13px] font-semibold text-gray-500 tracking-wide uppercase">Positive</p>
            <h3 className="text-xl font-bold text-gray-800 truncate mt-1">{positiveCount}</h3>
          </div>
          <div className="p-2.5 bg-green-50 text-green-500 rounded shrink-0">
            <ThumbsUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-gray-200 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <p className="text-[13px] font-semibold text-gray-500 tracking-wide uppercase">Need revision</p>
            <h3 className="text-xl font-bold text-gray-800 truncate mt-1">{revisionCount}</h3>
          </div>
          <div className="p-2.5 bg-orange-50 text-orange-500 rounded shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Data Container */}
      {loading ? (
        <div className="flex justify-center items-center h-48 border border-gray-200 rounded bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : feedback.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded p-16 flex flex-col items-center justify-center text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-[15px] font-semibold text-gray-800">No feedback received yet</p>
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-700">Feedback History</h2>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-gray-100">
              {feedback.map((item, idx) => (
                <li key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                       <div className="w-10 h-10 rounded bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-blue-600 font-bold mr-3 shrink-0">
                          {item.supervisorName ? item.supervisorName.charAt(0).toUpperCase() : "S"}
                       </div>
                       <div>
                         <h3 className="text-[15px] font-bold text-gray-800">{item.title || "Feedback"}</h3>
                         <p className="text-[12px] text-gray-500 font-medium">From: {item.supervisorName || "Supervisor"}</p>
                       </div>
                    </div>
                    <span className="text-[12px] font-semibold text-gray-400 mt-1">
                      {new Date(item.createdAt || Date.now()).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="ml-[52px]">
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded border mb-2.5 ${
                              item.type === 'positive' ? 'bg-green-50 text-green-700 border-green-200' : 
                              item.type === 'negative' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                        {item.type || "General"}
                      </span>
                      <p className="text-[14px] text-gray-700 leading-relaxed bg-white border border-gray-200 p-4 rounded shadow-sm">
                        {item.message}
                      </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
