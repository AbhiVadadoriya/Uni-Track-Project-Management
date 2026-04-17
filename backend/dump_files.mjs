import mongoose from 'mongoose';
import { config } from 'dotenv';
config({ path: 'frontend/.env' }); // or backend/.env?
config({ path: 'backend/.env' }); 

const ProjectSchema = new mongoose.Schema({
  title: String,
  status: String,
  files: [{
    fileType: String,
    fileUrl: String,
    originalName: String,
    uploadAt: Date
  }]
});
const Project = mongoose.model('Project', ProjectSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/myDatabase");
  const projects = await Project.find();
  let c = 0;
  projects.forEach(p => {
     p.files.forEach(f => {
         console.log(JSON.stringify(f, null, 2));
         c++;
     });
  });
  console.log("Total files found:", c);
  process.exit(0);
}
run();
