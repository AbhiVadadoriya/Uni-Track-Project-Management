import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Project } from './models/Project.js';
import { User } from './models/user.js';
import * as projectService from "./services/ProjectServices.js";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myDatabase", { dbName: "myDatabase" });
        
        const projectBefore = await Project.findOne();
        const user = await User.findOne({role: 'Admin'});

        if (!projectBefore || !user) {
            console.log("No projecting or admin user.");
            process.exit(0);
        }

        const id = projectBefore._id;
        
        const project = await projectService.getProjectById(id);
        const userRole = (user.role || "").toLowerCase();
        const userId = user._id?.toString() || user.id;
        const hasAccess =
            userRole === "admin" ||
            project.student._id.toString() === userId ||
            (project.supervisor && project.supervisor._id.toString() === userId);

        if (!hasAccess) {
            console.error("NO ACCESS ERROR!");
            process.exit(0);
        }

        const updatedProject = await projectService.updateProject(id, {status: "approved"});
        console.log("SUCCESS!", updatedProject.status);

    } catch (e) {
        console.error("CONNECTION ERROR:", e);
    } finally {
        process.exit(0);
    }
}
run();
