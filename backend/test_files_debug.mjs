import mongoose from 'mongoose';
import { config } from 'dotenv';
config({ path: 'backend/.env' }); // or frontend/.env

const ProjectSchema = new mongoose.Schema({
  title: String,
  status: String,
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  files: [{
    fileType: String,
    fileUrl: String,
    originalName: String,
    uploadAt: Date
  }]
});
const Project = mongoose.model('Project', ProjectSchema);

const UserSchema = new mongoose.Schema({
  name: String, email: String, role: String
});
const User = mongoose.model('User', UserSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/myDatabase");
  
  // Find all projects
  const projects = await Project.find().populate('student').populate('supervisor');
  
  console.log("Total Projects in DB:", projects.length);
  
  projects.forEach(p => {
     console.log(`\nProject: ${p.title} | Status: ${p.status} | Supervisor: ${p.supervisor?._id} (${p.supervisor?.name})`);
     console.log(`Student: ${p.student?.name} (${p.student?._id})`);
     console.log(`Files count: ${p.files?.length || 0}`);
     p.files?.forEach(f => {
         console.log(` -> File: ${f.originalName} | Type: ${f.fileType}`);
     });
  });

  process.exit(0);
}
run();
