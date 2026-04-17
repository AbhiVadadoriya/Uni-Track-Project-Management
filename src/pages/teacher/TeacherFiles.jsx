import { useEffect, useState } from "react";
import { ArrowDownToLine, Loader2, Search, FileText, Code, Image as ImageIcon, MonitorPlay, Files, Filter } from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

const TeacherFiles = () => {
  const [allFilesRaw, setAllFilesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const fetchAssigned = async () => {
    try {
      // Use the dedicated backend aggregation route specifically built for this screen
      const res = await axiosInstance.get("/professor/files");
      setAllFilesRaw(res.data.data?.files || []);
    } catch (error) {
      toast.error("Failed to load project files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const handleDownload = async (projectId, fileId, filename) => {
    try {
      const res = await axiosInstance.get(`/project/${projectId}/files/${fileId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || "download");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to securely download file");
    }
  };

  const getCategory = (mimeType, originalName) => {
    const type = (mimeType || "").toLowerCase();
    const name = (originalName || "").toLowerCase();
    
    // Presentations (Must be checked BEFORE reports because PPTX mime contains 'officedocument'!)
    if (type.includes("presentation") || type.includes("powerpoint") || name.endsWith(".ppt") || name.endsWith(".pptx")) return "presentation";
    // Reports
    if (type.includes("pdf") || type.includes("word") || type.includes("wordprocessingml") || type.includes("document") || name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx")) return "report";
    // Images
    if (type.includes("image") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".gif")) return "image";
    // Code
    if (type.includes("javascript") || type.includes("json") || type.includes("html") || type.includes("css") || type.includes("text/plain") || name.endsWith(".js") || name.endsWith(".py") || name.endsWith(".html") || name.endsWith(".css") || name.endsWith(".json") || name.endsWith(".txt")) return "code";
    
    return "other";
  };

  const totalFiles = allFilesRaw.length;
  const reportCount = allFilesRaw.filter((f) => getCategory(f.fileType, f.originalName) === "report").length;
  const presentationCount = allFilesRaw.filter((f) => getCategory(f.fileType, f.originalName) === "presentation").length;
  const codeCount = allFilesRaw.filter((f) => getCategory(f.fileType, f.originalName) === "code").length;
  const imageCount = allFilesRaw.filter((f) => getCategory(f.fileType, f.originalName) === "image").length;

  const filteredFiles = allFilesRaw.filter((file) => {
    const term = searchTerm.toLowerCase();
    const safeFileName = file.originalName || "Unnamed File";
    const studentName = file.studentName || "";
    const matchesSearch = safeFileName.toLowerCase().includes(term) || studentName.toLowerCase().includes(term);
    const cat = getCategory(file.fileType, file.originalName);
    const matchesFilter = filterType === "all" || filterType === cat;
    return matchesSearch && matchesFilter;
  });

  const getFileFormatStyles = (mimeType, originalName) => {
    const type = (mimeType || "").toLowerCase();
    const name = (originalName || "").toLowerCase();
    
    if (type.includes("pdf") || name.endsWith(".pdf")) return { icon: <FileText className="w-6 h-6 text-red-500" />, bg: "bg-red-50 border-red-100 hover:border-red-300" };
    if (type.includes("word") || type.includes("document") || name.endsWith(".doc") || name.endsWith(".docx")) return { icon: <FileText className="w-6 h-6 text-blue-500" />, bg: "bg-blue-50 border-blue-100 hover:border-blue-300" };
    if (type.includes("presentation") || type.includes("powerpoint") || name.endsWith(".ppt") || name.endsWith(".pptx")) return { icon: <MonitorPlay className="w-6 h-6 text-orange-500" />, bg: "bg-orange-50 border-orange-100 hover:border-orange-300" };
    if (type.includes("image") || type.includes("png") || type.includes("jpg") || type.includes("jpeg") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".gif")) return { icon: <ImageIcon className="w-6 h-6 text-pink-500" />, bg: "bg-pink-50 border-pink-100 hover:border-pink-300" };
    if (type.includes("javascript") || type.includes("json") || type.includes("html") || type.includes("css") || type.includes("text/plain") || type.includes("code") || name.endsWith(".js") || name.endsWith(".json") || name.endsWith(".txt") || name.endsWith(".py") || name.endsWith(".html")) return { icon: <Code className="w-6 h-6 text-purple-500" />, bg: "bg-purple-50 border-purple-100 hover:border-purple-300" };
    if (type.includes("zip") || type.includes("archive") || type.includes("rar") || name.endsWith(".zip") || name.endsWith(".rar")) return { icon: <Files className="w-6 h-6 text-yellow-500" />, bg: "bg-yellow-50 border-yellow-100 hover:border-yellow-300" };
    return { icon: <Files className="w-6 h-6 text-gray-500" />, bg: "bg-gray-50 border-gray-200 hover:border-gray-300" };
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 font-sans relative text-gray-800">
      
      {/* Header Container */}
      <div className="bg-white p-6 rounded border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">Student Files</h1>
        </div>
        <div className="w-full md:w-auto text-right">
             <p className="text-[13px] text-gray-500 font-medium tracking-tight">Manage files shared with and received from students.</p>
        </div>
      </div>

      {/* Control Bar (Filter & Search) */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-48">
          <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-9 pr-8 p-2.5 text-[13px] font-bold border border-gray-200 bg-white rounded focus:border-blue-500 hover:border-gray-300 outline-none transition-all text-gray-700 cursor-pointer appearance-none shadow-sm"
          >
            <option value="all">All Files</option>
            <option value="report">Reports</option>
            <option value="presentation">Presentations</option>
            <option value="code">Code Files</option>
            <option value="image">Images</option>
          </select>
        </div>
        
        <div className="relative w-full flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 p-2.5 text-[13px] font-medium border border-gray-200 bg-white rounded focus:border-blue-500 hover:border-gray-300 outline-none transition-all text-gray-800 shadow-sm"
          />
        </div>
      </div>

      {/* 5 Metric Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50/50 p-5 rounded border border-blue-100 flex flex-col justify-center items-center text-center shadow-sm hover:border-blue-200 transition-colors">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
               <Files className="w-5 h-5" />
            </div>
            <h3 className="text-[22px] font-extrabold text-blue-900 leading-none">{totalFiles}</h3>
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-2 px-2">Total Files</p>
        </div>
        <div className="bg-red-50/50 p-5 rounded border border-red-100 flex flex-col justify-center items-center text-center shadow-sm hover:border-red-200 transition-colors">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
               <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-[22px] font-extrabold text-red-900 leading-none">{reportCount}</h3>
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-widest mt-2 px-2">Reports</p>
        </div>
        <div className="bg-orange-50/50 p-5 rounded border border-orange-100 flex flex-col justify-center items-center text-center shadow-sm hover:border-orange-200 transition-colors">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
               <MonitorPlay className="w-5 h-5" />
            </div>
            <h3 className="text-[22px] font-extrabold text-orange-900 leading-none">{presentationCount}</h3>
            <p className="text-[11px] font-bold text-orange-600 uppercase tracking-widest mt-2 px-2">Presentations</p>
        </div>
        <div className="bg-purple-50/50 p-5 rounded border border-purple-100 flex flex-col justify-center items-center text-center shadow-sm hover:border-purple-200 transition-colors">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
               <Code className="w-5 h-5" />
            </div>
            <h3 className="text-[22px] font-extrabold text-purple-900 leading-none">{codeCount}</h3>
            <p className="text-[11px] font-bold text-purple-600 uppercase tracking-widest mt-2 px-2">Code Files</p>
        </div>
        <div className="bg-pink-50/50 p-5 rounded border border-pink-100 flex flex-col justify-center items-center text-center shadow-sm hover:border-pink-200 transition-colors">
            <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-3">
               <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="text-[22px] font-extrabold text-pink-900 leading-none">{imageCount}</h3>
            <p className="text-[11px] font-bold text-pink-600 uppercase tracking-widest mt-2 px-2">Images</p>
        </div>
      </div>

      {/* Main Content Area - File List */}
      {loading ? (
        <div className="flex justify-center items-center h-48 border border-gray-200 rounded bg-white shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="space-y-3">
          {filteredFiles.map((file, idx) => {
            const formatData = getFileFormatStyles(file.fileType, file.originalName);
            return (
            <div key={idx} className="bg-white rounded border border-gray-200 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-blue-300 transition-colors shadow-sm group">
               
               <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded border flex items-center justify-center shrink-0 transition-colors ${formatData.bg}`}>
                     {formatData.icon}
                  </div>
                  <div className="min-w-0">
                     <div className="flex flex-wrap items-center gap-2">
                         <h3 className="text-[14px] font-bold text-gray-800 tracking-tight truncate max-w-[250px]" title={file.originalName || "Unnamed File"}>{file.originalName || "Unnamed File"}</h3>
                         <span className="text-[13px] text-gray-500 font-medium truncate">{file.studentName}</span>
                         <span className="text-gray-300 font-bold px-1 text-[13px]">-</span>
                         <span className="text-[13px] text-gray-500 font-medium shrink-0">{file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</span>
                     </div>
                  </div>
               </div>

               <div className="sm:shrink-0 flex items-center justify-end">
                   <button
                     onClick={() => handleDownload(file.projectId, file._id, file.originalName)}
                     className="px-4 py-2.5 text-[12px] font-bold bg-white text-gray-700 border border-gray-200 rounded hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center tracking-wide"
                     title="Download File"
                   >
                     <ArrowDownToLine className="w-4 h-4 mr-2" />
                     Download
                   </button>
               </div>
               
            </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded p-16 text-center shadow-sm">
          <Files className="w-12 h-12 text-gray-300 mb-4" />
          <h2 className="text-[17px] font-bold text-gray-800 tracking-tight">No Files Found</h2>
          <p className="text-gray-500 mt-2 max-w-sm text-[13px] font-medium">There are no uploaded files matching your search criteria at this time.</p>
        </div>
      )}

    </div>
  );
};

export default TeacherFiles;
