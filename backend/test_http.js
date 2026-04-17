import axios from 'axios';
import mongoose from 'mongoose';
import { User } from './models/user.js';
import { Project } from './models/Project.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myDatabase", { dbName: "myDatabase" });
        
        const admin = await User.findOne({role: 'Admin'}).lean();
        const project = await Project.findOne().lean();
        
        if (!admin || !project) {
            console.log("Missing admin or project data");
            process.exit(0);
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "10h" });
        
        try {
            console.log(`Sending PUT to http://localhost:4000/api/v1/admin/project/${project._id}`);
            const response = await axios.put(`http://localhost:4000/api/v1/admin/project/${project._id}`, {
                status: "approved"
            }, {
                headers: {
                    Cookie: `token=${token}`
                }
            });
            console.log("RESPONSE SUCCESS:", response.data);
        } catch (apiErr) {
            console.log("RESPONSE ERROR STATUS:", apiErr.response?.status);
            console.log("RESPONSE ERROR DATA:", apiErr.response?.data);
        }
    } catch (e) {
        console.error("FATAL SCRIPT ERROR:", e.message);
    } finally {
        process.exit(0);
    }
}
run();
