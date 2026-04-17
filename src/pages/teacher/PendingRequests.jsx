import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { Check, X, Loader2, UserPlus, Search, FileText } from "lucide-react";

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get("/professor/requests");
      setRequests(res.data.data?.requests || []);
    } catch (err) {
      console.error("Failed to fetch requests", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading({ id, action });
    try {
      if (action === "accept") {
        await axiosInstance.put(`/professor/requests/${id}/accept`);
        toast.success("Request accepted! Project added to your supervision board.");
      } else {
        await axiosInstance.put(`/professor/requests/${id}/reject`);
        toast.success("Request declined.");
      }
      setRequests((prev) => 
        prev.map(req => 
            req._id === id ? { ...req, status: action === "accept" ? "accepted" : "rejected" } : req
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    // Hide ghost/deleted students entirely
    if (!req.student || !req.student.name) return false;

    const searchLower = searchTerm.toLowerCase();
    const studentName = req.student?.name?.toLowerCase() || "";
    const projectTitle = req.latestProject?.title?.toLowerCase() || "";
    const studentEmail = req.student?.email?.toLowerCase() || "";
    
    const matchesSearch = 
      studentName.includes(searchLower) || 
      projectTitle.includes(searchLower) ||
      studentEmail.includes(searchLower);
      
    const matchesStatus = statusFilter === "all" || req.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 font-sans relative text-gray-800">
      
      {/* Header Container */}
      <div className="bg-white p-6 rounded border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-xl font-bold text-gray-800">Pending Supervision Requests</h1>
          <p className="text-[13px] text-gray-500 mt-1">Review and respond to student supervision requests</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-[13px] font-medium border border-gray-200 rounded outline-none bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors text-gray-700"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-[13px] font-medium border border-gray-200 rounded bg-gray-50 text-gray-700 outline-none hover:bg-white focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 border border-gray-200 rounded bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-5 text-[11px] font-semibold tracking-wide uppercase text-gray-500">Student Info</th>
                  <th className="py-3 px-5 text-[11px] font-semibold tracking-wide uppercase text-gray-500">Proposed Project</th>
                  <th className="py-3 px-5 text-[11px] font-semibold tracking-wide uppercase text-gray-500">Date Received</th>
                  <th className="py-3 px-5 text-[11px] font-semibold tracking-wide uppercase text-gray-500">Status</th>
                  <th className="py-3 px-5 text-[11px] font-semibold tracking-wide uppercase text-gray-500 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shrink-0">
                          {req.student?.name?.charAt(0) || "S"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[14px] text-gray-800 truncate leading-tight group-hover:text-blue-600 transition-colors">{req.student?.name || "Unknown Student"}</p>
                          <p className="text-[12px] text-gray-500 font-medium truncate mt-0.5">{req.student?.email || "No Email Provided"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-gray-50 rounded border border-gray-100 text-gray-400 shrink-0 mt-0.5">
                             <FileText className="w-4 h-4" />
                         </div>
                         <div className="min-w-0 max-w-[280px]">
                            <span className="text-[13px] text-gray-800 font-bold block truncate leading-tight">{req.latestProject?.title || "Untitled Proposal"}</span>
                            <span className="text-[12px] text-gray-500 font-medium block truncate mt-1">{req.message || "No additional message attached."}</span>
                         </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <p className="font-semibold text-gray-700 text-[13px]">
                        {new Date(req.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded border ${
                          req.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : 
                          req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {req.status}
                        </span>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                       {req.status?.toLowerCase() === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(req._id, "accept")}
                              disabled={actionLoading?.id === req._id}
                              className="px-3 py-1.5 text-[13px] font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center disabled:opacity-60"
                            >
                              {actionLoading?.id === req._id && actionLoading?.action === "accept" && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => handleAction(req._id, "reject")}
                              disabled={actionLoading?.id === req._id}
                              className="px-3 py-1.5 text-[13px] font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center disabled:opacity-60"
                            >
                              {actionLoading?.id === req._id && actionLoading?.action === "reject" && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              )}
                              Reject
                            </button>
                          </div>
                       ) : (
                           <span className="text-[13px] text-gray-400 italic px-2 py-1 bg-gray-50 border border-gray-200 rounded">Processed</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded p-16 text-center">
          <UserPlus className="w-12 h-12 text-gray-300 mb-4" />
          <h2 className="text-[17px] font-bold text-gray-800">
            {searchTerm 
              ? `No requests found matching "${searchTerm}"`
              : statusFilter !== 'all'
                ? `No ${statusFilter} requests found`
                : "No Supervision Requests Found"}
          </h2>
          <p className="text-gray-500 mt-2 max-w-sm text-[13px] font-medium">
             {searchTerm 
              ? "Try adjusting your search terms or filters to find what you're looking for."
              : "You currently have no new supervision requests from students that match your filter."}
          </p>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
