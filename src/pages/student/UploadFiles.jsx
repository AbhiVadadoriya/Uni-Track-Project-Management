import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FileText, MonitorPlay, Code, File as FileIcon, X, Loader2, AlertCircle, FileQuestion, UploadCloud, Download } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { fetchStudentProject } from "../../store/slices/studentSlice";
import { Link } from "react-router-dom";

const UploadFiles = () => {
  const [selectedDocs, setSelectedDocs] = useState({
    report: null,
    presentation: null,
    code: null
  });
  const [isUploading, setIsUploading] = useState(false);
  
  const reportRef = useRef(null);
  const presentationRef = useRef(null);
  const codeRef = useRef(null);

  const { project } = useSelector((state) => state.student);
  const dispatch = useDispatch();

  useEffect(() => {
    // Explicit runtime validation resolving Redux unmounts on explicit physical page reloads
    if (!project) {
        dispatch(fetchStudentProject());
    }
  }, [dispatch, project]);

  const handleFileChange = (e, type) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedDocs(prev => ({
        ...prev,
        [type]: e.target.files[0]
      }));
    }
  };

  const removeFile = (type) => {
    setSelectedDocs(prev => ({
      ...prev,
      [type]: null
    }));
    // Reset the actual input value securely
    if(type === 'report' && reportRef.current) reportRef.current.value = "";
    if(type === 'presentation' && presentationRef.current) presentationRef.current.value = "";
    if(type === 'code' && codeRef.current) codeRef.current.value = "";
  };

  const handleUpload = async () => {
    const filesToUpload = Object.values(selectedDocs).filter(Boolean);
    if (!filesToUpload.length) {
      toast.warn("Please select at least one file to upload.");
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    filesToUpload.forEach((file) => formData.append("files", file));

    try {
      await axiosInstance.post(`/student/upload/${project._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Files uploaded successfully!");
      
      // Clear selections automatically post-upload
      setSelectedDocs({ report: null, presentation: null, code: null });
      if(reportRef.current) reportRef.current.value = "";
      if(presentationRef.current) presentationRef.current.value = "";
      if(codeRef.current) codeRef.current.value = "";

      dispatch(fetchStudentProject());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await axiosInstance.get(`/student/download/${project._id}/${fileId}`, {
        responseType: 'blob', // Force payload output correctly bypassing JSON schema
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to securely download file payload.");
    }
  };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-lg shadow-sm border border-slate-200 p-10 text-center">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Active Project</h2>
        <p className="text-slate-500 mt-2 max-w-md">You need an active project to upload files. Submit a proposal first.</p>
        <Link to="/student/proposal" className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 transition">Go to Proposals</Link>
      </div>
    );
  }

  const hasSelectedFiles = Object.values(selectedDocs).some(Boolean);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Block Minimalist */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Upload Project Files</h1>
        <p className="text-sm text-slate-500 mt-1">Upload your project documents icluding reports, presentations, and code files.</p>
      </div>

      {/* Upload Quadrants (3 Explicit Modules based on screenshot constraints) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Report */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center text-center">
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 w-full flex flex-col items-center justify-center bg-slate-50 relative">
            <FileText className="w-12 h-12 text-blue-500 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Report</h3>
            <p className="text-xs text-slate-500 mt-1">Upload your project report (PDF, DOC)</p>
            
            <input
              ref={reportRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, "report")}
              className="hidden"
            />
            
            <button
              onClick={() => reportRef.current.click()}
              className="mt-5 bg-white border border-slate-200 text-xs text-slate-700 font-semibold px-4 py-2 rounded-md shadow-sm hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              Choose Report
            </button>
          </div>
        </div>

        {/* Module 2: Presentation */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center text-center">
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 w-full flex flex-col items-center justify-center bg-slate-50 relative">
            <MonitorPlay className="w-12 h-12 text-amber-500 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Presentation</h3>
            <p className="text-xs text-slate-500 mt-1">Upload your presentation(PPT,PPTX,PDF)</p>
            
            <input
              ref={presentationRef}
              type="file"
              accept=".ppt,.pptx,.pdf"
              onChange={(e) => handleFileChange(e, "presentation")}
              className="hidden"
            />
            
            <button
              onClick={() => presentationRef.current.click()}
              className="mt-5 bg-white border border-slate-200 text-xs text-slate-700 font-semibold px-4 py-2 rounded-md shadow-sm hover:border-amber-500 hover:text-amber-600 transition-colors"
            >
              Choose Presentation
            </button>
          </div>
        </div>

        {/* Module 3: Code File */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center text-center">
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 w-full flex flex-col items-center justify-center bg-slate-50 relative">
            <Code className="w-12 h-12 text-emerald-500 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Code file</h3>
            <p className="text-xs text-slate-500 mt-1">Upload Your source code (ZIP, RAR, TAR)</p>
            
            <input
              ref={codeRef}
              type="file"
              accept=".zip,.rar,.tar,.tar.gz"
              onChange={(e) => handleFileChange(e, "code")}
              className="hidden"
            />
            
            <button
              onClick={() => codeRef.current.click()}
              className="mt-5 bg-white border border-slate-200 text-xs text-slate-700 font-semibold px-4 py-2 rounded-md shadow-sm hover:border-emerald-500 hover:text-emerald-600 transition-colors"
            >
              Choose Source Code
            </button>
          </div>
        </div>

      </div>

      {/* Permanent Ready to Upload Status Block */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ready to upload</h3>
            <p className="text-xs text-slate-500 mt-0.5">Files staged for project deployment</p>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={!hasSelectedFiles || isUploading}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
            {isUploading ? "Uploading..." : "Upload Selected Files"}
          </button>
        </div>

        {hasSelectedFiles ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(selectedDocs).map(([type, file]) => {
              if (!file) return null;
              return (
                <div key={type} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md shadow-sm">
                  <div className="flex items-center overflow-hidden">
                    <FileIcon className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                    <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(type)} className="p-1 h-6 w-6 flex items-center justify-center hover:bg-slate-200 rounded-md text-slate-500 hover:text-red-600 transition-colors shrink-0 ml-3">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-slate-400 bg-slate-50 border border-slate-100 border-dashed rounded-md">
            No files staged for upload right now.
          </div>
        )}
      </div>

      {/* Uploaded Files Manager */}
      <div className="bg-white border rounded-lg border-slate-200 shadow-sm p-6 overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800">Uploaded Files</h3>
        <p className="text-sm text-slate-500 mt-1 mb-6">Manage Your uploaded project files</p>
        
        {project?.files?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.files.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-md shadow-sm hover:border-blue-400 transition-colors group">
                <div className="flex items-center overflow-hidden">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-md text-blue-600 mr-4 shrink-0 shadow-sm group-hover:border-blue-300 transition-colors">
                    <FileIcon className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden pr-4">
                    <h4 className="text-sm font-bold text-slate-700 truncate" title={f.originalName || f.filename}>{f.originalName || f.filename}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Uploaded securely</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDownload(f._id, f.originalName || f.filename || "downloaded-file")}
                  className="p-2 bg-white text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded shadow-sm shrink-0 transition-all flex items-center justify-center"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-md border border-slate-100 border-dashed">
            <FileQuestion className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">No file uploaded yet.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default UploadFiles;
