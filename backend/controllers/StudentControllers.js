import { Deadline } from "../models/deadline.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler  from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userService from "../services/userService.js";
import * as projectService from '../services/ProjectServices.js';
import * as requestService from "../services/requestService.js";
import * as notificationService from "../services/notificationService.js";
import { Project } from "../models/Project.js";
import { Notification } from "../models/notification.js";
import * as fileService from "../services/fileService.js";


export const getStudentProject = asyncHandler(async(req, res, next) => {
    const studentId = req.user.id;

    const project  = await projectService.getProjectByStudent(studentId);

    if(!project){
        return res.status(200).json({
            success: true,
            data: {project: null},
            message: "No project found for this student",
        });
    }
    res.status(200).json({
        success: true,
        data: {project},
    });
});


export const submitProposal = asyncHandler(async(req, res, next) => {
    const {title, description} = req.body;
    const studentId = req.user._id;

    const existingProject = await projectService.getProjectByStudent(studentId);

    if(existingProject && existingProject.status !== "rejected"){
        return next(new ErrorHandler("You already have an active project. You can only submit a new proposal if the previous one was rejected.", 400))
    }

    if(existingProject && existingProject.status === "rejected"){
        await Project.findByIdAndDelete(existingProject._id);
    }

    const projectData = {
        student: studentId,
        title,
        description,
    };
    const project = await projectService.createProject(projectData);

    await User.findByIdAndUpdate(studentId, {project: project._id});

    res.status(201).json({
        success: true,
        data: {project},
        message: "Project proposal submitted successfully",
    });

});

export const uploadFiles = asyncHandler(async(req, res, next) => {
    const {projectId} = req.params;
    const studentId = req.user.id;
    const project = await projectService.getProjectById(projectId);

    if(!project || project.student._id.toString() !== studentId.toString() || project.status === "rejected"){
        return next(new ErrorHandler("Not authorized to upload files for this project", 403));
    }
    if(!req.files || req.files.length === 0){
        return next(new ErrorHandler("No files uploaded", 400));
    }
    const updatedProject = await projectService.addFilesToProject(projectId, req.files);
    res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: {project: updatedProject},

    });
});

export const getAvailableSupervisors = asyncHandler(async(req, res, next) => {
    const supervisors = await User.find({role:"Professor"}).select("name email department expertise").lean();

    res.status(200).json({
        success: true,
        data: {supervisors},
        message: "Available supervisors fetched successfully",
    })
})

export const getSupervisor = asyncHandler(async(req, res, next) => {
    const studentId = req.user.id;
    const student = await User.findById(studentId).populate("supervisor", "name email department expertise");
    if(!student.supervisor){
        return res.status(200).json({
            success: true,
            data: {supervisor: null},
            message: "No supervisor assigned yet",
        });
    }
        res.status(200).json({
            success: true,
            data: {supervisor: student.supervisor},
        });
});

export const requestSupervisor = asyncHandler(async(req, res, next) => {
    const { supervisorId, professorId, message } = req.body;
    const studentId = req.user.id;

    const supervisorID = supervisorId || professorId;
    if (!supervisorID) {
        return next(new ErrorHandler("Supervisor ID is required.", 400));
    }

    const student = await User.findById(studentId);
    if (student.supervisor) {
        return next(new ErrorHandler("you already have a supervisor assigned.", 400));
    }
    const supervisor = await User.findById(supervisorID);
    if (!supervisor || ![ "Professor"].includes(supervisor.role)) {
        return next(new ErrorHandler("Invalid supervisor selected.", 400));
    }
    if (supervisor.maxStudents === supervisor.assignedStudents.length) {
        return next(new ErrorHandler("Selected supervisor has reached maximum student capacity.", 400));
    }

    const requestData = {
        student: studentId,
        supervisor: supervisorID,
        message,
    };
    const request = await requestService.createRequest(requestData);

    await notificationService.notifyUser(
        supervisorID,
        `${student.name} has request ${supervisor.name} to be their supervisor.`,
        "request",
        "/professor/requests",
        "medium"
    );

    res.status(201).json({
        success: true,
        data: { request },
        message: "Supervisor request submitted successfully",
    });
});


export const getDashboardStats = asyncHandler(async(req,res,next)=>{
    const studentId = req.user._id;

    const project = await Project.findOne({student: studentId}).sort({createdAt: -1}).populate('supervisor', 'name').lean();


    const now = new Date();
    let upcomingDeadlines = [];
    if (project) {
        upcomingDeadlines = await Deadline.find({ project: project._id, dueDate: { $gte: now } })
            .select("name dueDate")
            .sort({ dueDate: 1 })
            .limit(4)
            .lean();
    }

     const topNotifications = await Notification.find({user: studentId}).populate('user', 'name').sort({createdAt: -1}).limit(3).lean();

      const feedbackNotifications = project?.feedback && project?.feedback.length > 0 ? [...project.feedback]
      .sort((a, b)=> new Date(b.createdAt) -new Date(a.createdAt)).slice(0,2) : [];

      const supervisorName = project?.supervisor?.name || null;

      res.status(200).json({
        success: true,
        message: "Dashboard stats fetched successfully",
        data: {
            project,
            upcomingDeadlines,
            topNotifications,
            feedbackNotifications,
            supervisorName,
        },
      });
});

export const getfeedback = asyncHandler(async(req,res,next)=>{
    const {projectId} = req.params;
    const studentId = req.user._id;

    const project = await projectService.getProjectById(projectId);

    if(!project || project.student._id.toString() !== studentId.toString()){
        return next(new ErrorHandler("Not authorized to view feedback for this project", 403));
    }
    const sortedFeedback = [...project.feedback].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map((f)=>({
        _id: f._id,
        title: f.title,
        message: f.message,
        type: f.type,
        createdAt: f.createdAt,
        supervisorName: f.supervisorId?.name,
        supervisorEmail: f.supervisorId?.email,
    }))

    res.status(200).json({
        success: true,
        data: {feedback: sortedFeedback},
    });
});

export const downloadFile = asyncHandler(async(req,res,next)=>{
    const {projectId,fileId} = req.params;
    const studentId = req.user._id;

    const project = await projectService.getProjectById(projectId);
    if(!project) return next(new ErrorHandler("Project not found", 404));
    if(project.student._id.toString() !== studentId.toString()){
        return next(new ErrorHandler("Not authorized to download file", 403));
    }
    const file = project.files.id(fileId);
    if(!file) return next(new ErrorHandler("File not found", 404));

    fileService.streamDownload(file.fileUrl,res, file.originalName);
});