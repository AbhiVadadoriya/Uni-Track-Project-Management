import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler  from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userService from "../services/userService.js";
import * as notificationService from "../services/notificationService.js";
import * as projectService from "../services/ProjectServices.js";
import { Project } from "../models/Project.js";
import { SupervisorRequest } from "../models/SupervisorRequest.js";


export const createStudent = asyncHandler(async (req, res, next) => {
 
    const {name, email, password, department} = req.body;
    if (!name || !email || !password || !department) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    } 
    let user = await userService.createUser({name, 
        email, 
        password, 
        department, 
        role:"Student"
    });
    res.status(201).json({
        success:true,
        message:"Student created successfully",
        data : {user},
    })
});

export const updateStudent = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    const updateData = {...req.body };
    delete updateData.role;
    const user = await userService.updateUser(id, updateData);
    if (!user) {
        return next(new ErrorHandler("Student not found", 404));
    }
    res.status(200).json({
        success:true,
        message:"Student updated successfully",
        data : {user},
});
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    const user = await userService.getUserById(id);
    if (!user) {
        return next(new ErrorHandler("Student not found", 404));
    }

    if (user.role !== "Student") {
        return next(new ErrorHandler("User is not a student", 400));
    }
    
    await userService.deleteUser(id);
    res.status(200).json({
        success:true,
        message:"Student deleted successfully",
    });

});

export const createProfessor = asyncHandler(async (req, res, next) => {
    const {name, email, password, department, maxStudents, expertise} = req.body;
    if (!name || !email || !password || !department || !maxStudents || !expertise) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    } 
    let user = await userService.createUser({name, 
        email, 
        password, 
        department, 
        maxStudents,
        expertise: Array.isArray(expertise) ? expertise :typeof expertise === "string" && expertise.trim() !== "" ? expertise.split(",").map(s => s.trim()) : [],
        role:"Professor",
    });
    res.status(201).json({
        success:true,
        message:"Professor created successfully",
        data : {user},
    })
});

export const createAdmin = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    const user = await userService.createUser({
        name,
        email,
        password,
        role: "Admin",
    });

    res.status(201).json({
        success: true,
        message: "Admin created successfully",
        data: { user },
    });
});

export const updateAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    delete updateData.role;

    const user = await userService.updateUser(id, updateData);

    if (!user) {
        return next(new ErrorHandler("Admin not found", 404));
    }

    if (user.role !== "Admin") {
        return next(new ErrorHandler("User is not an admin", 400));
    }

    res.status(200).json({
        success: true,
        message: "Admin updated successfully",
        data: { user },
    });
});

export const deleteAdmin = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
        return next(new ErrorHandler("Admin not found", 404));
    }

    if (user.role !== "Admin") {
        return next(new ErrorHandler("User is not an admin", 400));
    }

    await userService.deleteUser(id);

    res.status(200).json({
        success: true,
        message: "Admin deleted successfully",
    });
});

export const updateProfessor = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    const updateData = {...req.body };
    delete updateData.role;
    const user = await userService.updateUser(id, updateData);
    if (!user) {
        return next(new ErrorHandler("Professor not found", 404));
    }
    res.status(200).json({
        success:true,
        message:"Professor updated successfully",
        data : {user},
});
});


export const deleteProfessor = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    const user = await userService.getUserById(id);
    if (!user) {
        return next(new ErrorHandler("Professor not found", 404));
    }

    if (user.role !== "Professor") {
        return next(new ErrorHandler("User is not a professor", 400));
    }
    
    await userService.deleteUser(id);
    res.status(200).json({
        success:true,
        message:"Professor deleted successfully",
    });

});

export const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await userService.getAllUsers();
    // console.log(users);
    res.status(200).json({
        success:true,
        message:"Users fetched successfully",
        data : {users},
    })
});

export const getAllAdmins = asyncHandler(async (req, res, next) => {
    const admins = await User.find({ role: "Admin" })
        .select("-password -resetPasswordToken -resetPasswordExpire")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: "Admins fetched successfully",
        data: { admins },
    });
});

export const getAllProjects = asyncHandler(async (req, res, next) => {
    const projects = await projectService.getAllProjects();
    res.json({
        success: true,
        message: "Projects fetched successfully",
        data : {projects},
    });
});


export const getDashboardStats = asyncHandler(async (req, res, next) => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const [totalStudents, totalProfessors, totalProjects, pendingRequests, completedProjects, pendingProjects, nearingDeadline] = await Promise.all([
        User.countDocuments({role: "Student"}),
        User.countDocuments({role: "Professor"}),
        Project.countDocuments(),
        SupervisorRequest.countDocuments({status: "pending"}),
        Project.countDocuments({status: "completed"}),
        Project.countDocuments({status: "pending"}),
        Project.countDocuments({ deadline: { $gte: today, $lte: nextWeek } })
    ]);

    const supervisorDistribution = await Project.aggregate([
        { $match: { supervisor: { $ne: null } } },
        { $group: { _id: "$supervisor", count: { $sum: 1 } } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "supervisorInfo" } },
        { $unwind: "$supervisorInfo" },
        { $project: { name: "$supervisorInfo.name", count: 1, _id: 0 } }
    ]);

    const recentProjects = await Project.find().sort({ updatedAt: -1 }).limit(3).populate('student', 'name').populate('supervisor', 'name');

    const recentActivities = recentProjects.map(p => ({
        title: "Project Update",
        desc: `${p.student?.name || 'A student'} updated '${p.title}'. Status: ${p.status}.`,
        time: p.updatedAt || p.createdAt,
    }));

    const dynamicQuickActions = [];
    
    if (pendingRequests > 0) {
        dynamicQuickActions.push({
            title: `Review ${pendingRequests} Pending ${pendingRequests === 1 ? 'Request' : 'Requests'}`,
            icon: "Clock",
            link: "/admin/requests",
            color: "text-amber-500"
        });
    }

    dynamicQuickActions.push({ 
        title: "Add New Student", 
        icon: "UserPlus", 
        link: "/admin/students", 
        color: "text-slate-600" 
    });
    
    dynamicQuickActions.push({ 
        title: "Add New Professor", 
        icon: "UserPlus", 
        link: "/admin/teachers", 
        color: "text-slate-600" 
    });

    if (nearingDeadline > 0 && dynamicQuickActions.length < 3) {
        dynamicQuickActions.push({
            title: `Manage ${nearingDeadline} Deadlines`,
            icon: "AlertCircle",
            link: "/admin/deadlines",
            color: "text-red-500"
        });
    }
    
    if (dynamicQuickActions.length < 3) {
        dynamicQuickActions.push({ title: "View System Reports", icon: "FileText", link: "/admin/projects", color: "text-slate-600" });
    }

    res.status(200).json({
        success: true,
        message: "Admin dashboard stats fetched",
        data: {
            stats:{
                totalStudents,
                totalProfessors,
                totalProjects,
                pendingRequests,
                completedProjects,
                pendingProjects,
                nearingDeadline,
            },
            supervisorDistribution,
            recentActivities,
            quickActions: dynamicQuickActions.slice(0, 3)
        }
    })
});


export const assignSupervisor = asyncHandler(async (req, res, next) => {
    const {studentId, supervisorId} = req.body;

    if(!studentId || !supervisorId) {
        return next(new ErrorHandler("Student ID and Supervisor ID are required", 400));
    }

    const project = await Project.findOne({student: studentId});

    if(!project) {
        return next(new ErrorHandler("Project not found", 404));
    }

    // Allow reassignment overwriting

    // Directly bind and approve the project natively upon assignment
    // (Bypassing restrictive pending queues to streamline Admin workflows)
    if(project.status !== "approved") {
        project.status = "approved";
    }

    const {student, supervisor} = await userService.assignSupervisorDirectly(studentId, supervisorId);

    project.supervisor = supervisor._id;
    await project.save();

    await notificationService.notifyUser(studentId, `Your project has been assigned a supervisor: ${supervisor.name}`,
        "approval",
        "/students/status",
        "low"
    );
    

    await notificationService.notifyUser(supervisorId, `The student ${student.name} has been officially assigned to you for UNI-TRACK supervision.`,
        "general",
        "/professors/status",
        "low"
    );

    res.status(200).json({
        success: true,
        message: "Supervisor assigned successfully",
        data: {student, supervisor},
            
    });
    
});

export const getProject = asyncHandler(async(req,res,next)=>{
    const { id } = req.params;
    const project = await projectService.getProjectById(id);

    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }

    const user = req.user;
    const userRole = (user.role || "").toLowerCase();
    const userId = user._id?.toString() || user.id;
    const hasAccess =
        userRole === "admin" ||
        project.student._id.toString() === userId ||
        (project.supervisor && project.supervisor._id.toString() === userId);

    if (!hasAccess) {
        return next(new ErrorHandler("Not authorized to fetch project", 403));
    }

    return res.status(200).json({
        success: true,
        data: { project },
    });
});

export const updateProjectStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updatedData = req.body;
    const user = req.user;


     const project = await projectService.getProjectById(id);

    if (!project) {
        return next(new ErrorHandler("Project not found", 404));
    }

    
    const userRole = (user.role || "").toLowerCase();
    const userId = user._id?.toString() || user.id;
    const hasAccess =
        userRole === "admin" ||
        project.student._id.toString() === userId ||
        (project.supervisor && project.supervisor._id.toString() === userId);

    if (!hasAccess) {
        return next(new ErrorHandler("Not authorized to update project status", 403));
    }

    const updatedProject = await projectService.updateProject(id, updatedData);

    return res.status(200).json({
        success: true,
        message: "Project status updated successfully",
        data: { project: updatedProject }, 
    });
});