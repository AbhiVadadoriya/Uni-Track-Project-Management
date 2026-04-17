import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User } from './models/user.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017", { dbName: "myDatabase" });

  const professor = await User.findOne({ role: "Professor" });
  if (!professor) {
     console.log("No professor found in DB!");
     return process.exit(0);
  }
  
  // Generate token
  const token = jwt.sign({ id: professor._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
  });

  console.log("Fetching files from API as professor...");
  try {
      const res = await axios.get("http://localhost:4000/api/v1/professor/files", {
          headers: { Cookie: `token=${token}` }
      });
      console.log("API Response:");
      console.log(`Success: ${res.data.success}`);
      console.log(`Total: ${res.data.data.total}`);
      console.log("Files:");
      res.data.data.files.forEach(f => {
          console.log(`- ${f.originalName} by ${f.studentName}`);
      });
  } catch (e) {
      console.error("API Error:");
      if (e.response) {
          console.error(e.response.status, e.response.data);
      } else {
          console.error(e.message);
      }
  }

  process.exit(0);
}

run();
