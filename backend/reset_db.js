import mongoose from "mongoose";
import { Project } from "./models/Project.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myDatabase", { dbName: "myDatabase" });
        await Project.updateMany({}, { status: "pending" });
        console.log("SUCCESS: All Projects reset to 'pending'!");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
};
run();
