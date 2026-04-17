import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SupervisorRequest } from './models/SupervisorRequest.js';
import { Project } from './models/Project.js';
import { User } from './models/user.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.DB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/project02");

  const supervisorId = "SOME_ID"; // We don't even need this, let's just get all
  
  const requests = await SupervisorRequest.find().populate("student supervisor").lean();
  console.log("Total Requests:", requests.length);
  for (const r of requests) {
    console.log("------------------------")
    console.log("ID:", r._id);
    if (!r.student) {
       console.log("Student: NULL (Orphaned)");
    } else {
       console.log("Student Name:", r.student.name);
       console.log("Student Email:", r.student.email);
    }
  }
  
  process.exit(0);
}

run();
