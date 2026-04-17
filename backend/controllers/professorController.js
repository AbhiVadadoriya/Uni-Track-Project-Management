import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler  from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userService from "../services/userService.js";
import * as projectService from '../services/ProjectServices.js';
import * as requestService from "../services/requestService.js";
import * as notificationService from "../services/notificationService.js";
import { Project } from "../models/Project.js";
import { Notification } from "../models/notification.js";
import { SupervisorRequest } from "../models/SupervisorRequest.js";
import { rejectRequest as serviceRejectRequest } from "../services/requestService.js";
import * as fileService from "../services/fileService.js";
import { sendEmail } from "../services/emailService.js";
import { generateRequestAcceptTemplate, generateRequestRejectionTemplate } from "../utils/emailTemplates.js";


export const getProfessorDashboardStats = asyncHandler(async(req, res, next) => {
    const professorId = req.user._id;

    const assignedStudentsCount = await User.countDocuments({
        supervisor: professorId,
    });

    const pendingRequestsCount = await SupervisorRequest.countDocuments({
        supervisor: professorId, 
        status: "pending",
    });
     const completedProjectsCount = await Project.countDocuments({
        supervisor: professorId, 
        status: "completed",
    });
     const recentNotifications = await Notification.find({
        user: professorId,
    }).sort({ createdAt: -1 }).limit(5);

    const dashboardStats = {
        assignedStudentsCount,
        pendingRequestsCount,
        completedProjectsCount,
        recentNotifications,
    };

    res.status(200).json({
        success: true,
        message: "Dashboard stats fetched for professor successfully",
        data: {dashboardStats},
    });
});


export const getRequests = asyncHandler(async (req, res, next) => {
    const {supervisor} = req.query;
    
    const filters = { supervisor: req.user._id };
    if(supervisor) filters.supervisor = supervisor;

    const {requests, total} = await requestService.getAllRequests(filters);

    const updatedRequests = await Promise.all(requests.map(async (reqObj)=>{
        const requestObj = reqObj.toObject ? reqObj.toObject() : reqObj;
        if(requestObj?.student?._id){
            const latestProject = await Project.findOne({
                student: requestObj.student._id
            }).sort({createdAt: -1}).lean();

            return {...requestObj, latestProject};
        }
        return requestObj;
    }));
    res.status(200).json({
        success: true,
        message: "Requests fetched successfully",
        data: {
            requests: updatedRequests,
            total,
        }
    })
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
    const {requestId} = req.params;
    const professorId = req.user._id;

    const request = await requestService.acceptRequest(requestId, professorId);
    if(!request) return next(new ErrorHandler("Request not found",404));

    await notificationService.notifyUser(request.student._id, 
  `Your supervisor request has been accepted by ${req.user.name}`,
  "approval",
  "/students/status",
  "low"
);
const student = await User.findById(request.student._id);
if (student?.email) {
    const studentEmail = student.email;
    const message = generateRequestAcceptTemplate(req.user.name);
    try {
        await sendEmail({
            to: studentEmail,
            subject: "UNI-TRACK Project System - ✅ Supervisor Request Has Been Accepted",
            message,
        });
    } catch (emailError) {
        console.error("Accept request email failed:", emailError.message);
    }
}
res.status(200).json({ 
        success: true,
        message: "Request accepted successfully",
        data: {request},
})
   
});

export const rejectRequest = asyncHandler(async (req, res, next) => {
    const {requestId} = req.params;
    const professorId = req.user._id;

    const request = await serviceRejectRequest(requestId, professorId);
    if(!request) return next(new ErrorHandler("Request not found",404));

    await notificationService.notifyUser(request.student._id,
        `Your supervisor request has been rejected by ${req.user.name}`,
        "rejection",
        "/students/status",
        "high"
    );

    const student = await User.findById(request.student._id);
    if (student?.email) {
        const studentEmail = student.email;
        const message = generateRequestRejectionTemplate(req.user.name);
        try {
            await sendEmail({
                to: studentEmail,
                subject: "UNI-TRACK Project System - ❌ Supervisor Request Has Been Rejected",
                message,
            });
        } catch (emailError) {
            console.error("Reject request email failed:", emailError.message);
        }
    }

    res.status(200).json({
        success: true,
        message: "Request rejected successfully",
        data: {request},
    });
});


export const getAssignedStudents = asyncHandler(async (req, res, next) => {
    const professorId = req.user._id;
    // Correct: sort on the query, not the array
    const students = await User.find({supervisor: professorId})
        .populate("project")
        .sort({createdAt: -1});

    const total = await User.countDocuments({supervisor: professorId});

    res.status(200).json({
        success: true,
        message: "Assigned students fetched successfully",
        data: {
            students,
            total,
        },    
    });
});


export const markComplete = asyncHandler(async (req, res, next) => {
    const {projectId} = req.params;
    const professorId = req.user._id;
    
    const project = await projectService.getProjectById(projectId);

    if(!project) return next(new ErrorHandler("Project not found",404));
    if(project.supervisor._id.toString() !== professorId.toString()){
        return next(new ErrorHandler("You are not authorized to mark this project as complete",403));
    }

    const updatedProject = await projectService.markComplete(projectId);

    await notificationService.notifyUser(project.student._id,
        `Your project "${project.title}" has been marked as complete by ${req.user.name}`,
        "general",
        `/students/status`,
        "low"
    );

    res.status(200).json({
        success: true,
        message: "Project marked as complete successfully",
        data: {
            project: updatedProject,
        },    
    });
});


export const addFeedback = asyncHandler(async (req, res, next) => {

        const {projectId} = req.params;
        const professorId = req.user._id;
        const {message, title, type} = req.body;

        const project = await projectService.getProjectById(projectId);
        if(!project) return next(new ErrorHandler("Project not found",404));
        if(project.supervisor._id.toString() !== professorId.toString()){
            return next(new ErrorHandler("You are not authorized to add feedback to this project",403));
        }
        if(!message || !title) return next(new ErrorHandler("Feedback title and message are required",400));

        const {project: updatedProject, latestFeedback} = await projectService.AddFeedback(projectId, professorId, title, message, type);



        await notificationService.notifyUser(project.student._id,
            `You have received new feedback on your project "${project.title}" from ${req.user.name}`,
            "feedback",
            `/students/feedback`,
            type === "positive" ? "low" : type === "negative" ? "high" : "low"
        ); 
        res.status(200).json({
            success: true,
            message: "Feedback posted successfully",
            data: { 
                project: updatedProject, feedback: latestFeedback,
            },
        });
});

export const getFiles = asyncHandler(async(req, res, next) => {
    const professorId = req.user._id;

    const projects = await projectService.getProjectsBySupervisor(professorId);

    const allFiles = projects
        .filter(project => project.student) // Ignore orphaned projects
        .flatMap(project => project.files.map(file => ({
        ...file.toObject(),
        projectId: project._id,
        projectTitle: project.title,
        studentName: project.student?.name || "Unknown Student",
        studentEmail: project.student?.email || "No Email",
        uploadedAt: file.uploadedAt || file.uploadAt || project.updatedAt || project.createdAt,
    })));

    const total = allFiles.length;


    res.status(200).json({
        success: true,
        message: "Files fetched successfully",
        data: {
            files: allFiles,
            total,
        },
    });
});



export const downloadFile = asyncHandler(async(req,res,next)=>{
    const {projectId,fileId} = req.params;
    const professorId = req.user._id;

    const project = await projectService.getProjectById(projectId);
    if(!project) return next(new ErrorHandler("Project not found", 404));
    if(project.supervisor._id.toString() !== professorId.toString()){
        return next(new ErrorHandler("Not authorized to download file", 403));
    }
    const file = project.files.id(fileId);
    if(!file) return next(new ErrorHandler("File not found", 404));

    fileService.streamDownload(file.fileUrl,res, file.originalName);
});







