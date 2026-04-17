import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.js';
import { SupervisorRequest } from './models/SupervisorRequest.js';
import { Project } from './models/Project.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017", { dbName: "myDatabase" });

  // Find the professor
  const professor = await User.findOne({ role: "Professor" });
  if (!professor) {
     console.log("No professor found in DB!");
     return process.exit(0);
  }
  
  console.log("====== PROFESSOR LOG ======");
  console.log("Professor:", professor.name, "| Email:", professor.email, "| ID:", professor._id);

  const requests = await SupervisorRequest.find({ supervisor: professor._id }).populate("student").lean();
  console.log("\n--- Pending/Accepted/Rejected Requests ---");
  console.log("Total requests:", requests.length);
  requests.forEach(r => {
      console.log(`Req: ${r._id} | Status: ${r.status} | Student: ${r.student ? r.student.name : "NULL (orphaned)"}`);
  });

  const assignedStudents = await User.find({ supervisor: professor._id }).lean();
  console.log("\n--- Assigned Students ---");
  console.log("Total assigned students:", assignedStudents.length);
  assignedStudents.forEach(s => {
      console.log(`Assigned Student: ${s.name} | ID: ${s._id}`);
  });

  const projects = await Project.find({ supervisor: professor._id }).populate("student").lean();
  console.log("\n--- Projects under supervision ---");
  console.log("Total projects:", projects.length);
  projects.forEach(p => {
      console.log(`Project: ${p.title} | Status: ${p.status} | Student: ${p.student ? p.student.name : "NULL (orphaned)"}`);
      console.log(`  -> Files count: ${p.files ? p.files.length : 0}`);
  });

  process.exit(0);
}

run();
