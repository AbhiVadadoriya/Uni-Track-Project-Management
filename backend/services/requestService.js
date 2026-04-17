import {SupervisorRequest} from "../models/SupervisorRequest.js";
import { User } from "../models/user.js";
import { Project } from "../models/Project.js";

export const createRequest = async (requestData) => {
    const existingRequest = await SupervisorRequest.findOne({
        student: requestData.student,
        supervisor: requestData.supervisor,
        status: "pending",
    });

    if (existingRequest) {
        throw new Error("You have already sent a request to this supervisor. Please wait for their response.");
    }
    const request = await SupervisorRequest.create(requestData);
    return await request.save();
};

export const getAllRequests = async (filters) => {
    let requests = await SupervisorRequest.find(filters)
    .populate("student", "name email supervisor")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });
    
    // Filter out orphaned requests where the student was deleted
    requests = requests.filter(req => req.student != null);

    const total = requests.length;

    return {requests, total};
};
export const acceptRequest = async (requestId, professorId) => {

    const request = await SupervisorRequest.findById(requestId)
    .populate("student", "name email supervisor project")
    .populate("supervisor", "name email assignedStudents maxStudents");

    if (!request) throw new Error("Request not found");
    if(request.supervisor._id.toString() !== professorId.toString()){
        throw new Error("You are not authorized to accept this request");
    }

    if(request.status !== "pending"){
        throw new Error("This request has already been processed");
    }

    const student = await User.findById(request.student._id);
    const supervisor = await User.findById(professorId);

    if (!student || !supervisor) {
        throw new Error("Student or Professor not found");
    }

    if (student.supervisor && student.supervisor.toString() !== professorId.toString()) {
        throw new Error("Student is already assigned to another supervisor");
    }

    if (!student.supervisor) {
        if (supervisor.assignedStudents.length >= supervisor.maxStudents) {
            throw new Error("Supervisor has reached maximum student capacity");
        }

        student.supervisor = professorId;
        if (!supervisor.assignedStudents.some((id) => id.toString() === student._id.toString())) {
            supervisor.assignedStudents.push(student._id);
        }
        await Promise.all([student.save(), supervisor.save()]);
    }

    const activeProject = await Project.findOne({
        student: student._id,
        status: { $in: ["pending", "approved"] },
    }).sort({ createdAt: -1 });

    if (activeProject && !activeProject.supervisor) {
        activeProject.supervisor = professorId;
        await activeProject.save();
    }

    request.status = "accepted";
    await request.save();

    await SupervisorRequest.updateMany(
        {
            student: student._id,
            supervisor: { $ne: professorId },
            status: "pending",
        },
        { $set: { status: "rejected" } }
    );

   return request;
};
export const rejectRequest = async (requestId, professorId) => {
    const request = await SupervisorRequest.findById(requestId)
    .populate("student","name email")
    .populate("supervisor","name email");

    if(!request) throw new Error("Request not found");

    if(request.supervisor._id.toString() !== professorId.toString()){
        throw new Error("You are not authorized to reject this request"); 
    }
    if(request.status !== "pending"){
        throw new Error("This request has already been processed");
    }
    request.status = "rejected";
    await request.save();

    return request;
    
};