import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User } from './models/user.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017", { dbName: "myDatabase" });

  const professor = await User.findOne({ role: "Professor" });
  if (!professor) return process.exit(0);
  
  const token = jwt.sign({ id: professor._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });

  console.log("Fetching /professor/requests ...");
  try {
      const res = await axios.get("http://localhost:4000/api/v1/professor/requests", {
          headers: { Cookie: `token=${token}` }
      });
      console.log(`Success: ${res.data.success}`);
      console.log(`Total: ${res.data.data.total}`);
      console.log("Requests:");
      res.data.data.requests.forEach(r => {
          console.log(`- Req ${r._id} by ${r.student?.name || "No Name"}`);
      });
  } catch (e) {
      console.error(e.response ? e.response.data : e.message);
  }

  process.exit(0);
}

run();
