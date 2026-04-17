import { uploadFiles } from "../controllers/StudentControllers.js";
import ErrorHandler from "../middlewares/error.js";
import {Project} from "../models/Project.js";

export const getProjectByStudent = async (studentId) => {
    return await Project.findOne({student: studentId}).populate("supervisor", "name email").sort({createdAt: -1});
}

export const createProject = async (projectData) => {
    const project = new Project(projectData);
    await project.save();
    return project;
};

export const getProjectById = async(id)=>{
    const project = await Project.findById(id).populate("student","name email").populate("supervisor","name email").populate("feedback.supervisorId","name email");


    if(!project){
        throw new ErrorHandler("Project not found", 404);
    }
    return project;
};

export const addFilesToProject = async(projectId, files)=>{
    const project = await Project.findById(projectId);
    if(!project){
        throw new ErrorHandler("Project not found", 404);
    }
    const fileMetadata = files.map(file=>({
        fileType: file.mimetype,
        fileUrl: file.path,
        originalName: file.originalname,
        uploadAt: new Date(),
    }));
    project.files.push(...fileMetadata);
    await project.save();



    return project;
};

export const getAllProjects = async ()=>{
    const projects = await Project.find().populate("student","name email").populate("supervisor","name email").sort({createdAt: -1});
    return projects;
}


export const markComplete = async(projectId)=>{

    const project = await Project.findByIdAndUpdate(projectId, {status: "completed"}, {new: true, runValidators: true})
    .populate("student", "name email")
    .populate("supervisor", "name email");

    if(!project){
        throw new ErrorHandler("Project not found", 404);
    }
    return project;

};

export const AddFeedback = async(
    projectId,
    supervisorId,
    title,
    message,
    type
) =>{
    const project = await Project.findById(projectId);
    if(!project){
        throw new ErrorHandler("Project not found", 404);
    }

    project.feedback.push({
        supervisorId,
        message,
        title,
        type,
    });

    await project.save();
    const latestFeedback = project.feedback[project.feedback.length - 1];
    return {project, latestFeedback};
};


export const getProjectsBySupervisor = async(supervisorId) =>{
    return await Project.find({ supervisor: supervisorId })
        .populate("student", "name email")
        .populate("supervisor", "name email")
        .sort({ createdAt: -1 });
};


export const updateProject = async(id, updatedData) =>{
    const project = await Project.findByIdAndUpdate(id, updatedData, {new: true, runValidators: true})
    .populate("student", "name email")
    .populate("supervisor", "name email");

    if(!project){
        throw new ErrorHandler("Project not found", 404); 
    }
    return project;
}