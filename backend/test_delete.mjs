import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.js';
import * as userService from './services/userService.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.DB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/project02");

  // Create a dummy student
  const dummyStudent = await User.create({
    name: "Test Dummy",
    email: "dummy" + Date.now() + "@test.com",
    password: "password123",
    role: "Student",
    department: "Test Dept"
  });
  console.log("Dummy student created:", dummyStudent._id);

  try {
    console.log("Attempting to delete Dummy student...");
    await userService.deleteUser(dummyStudent._id);
    console.log("Dummy student deleted successfully");
  } catch (e) {
    console.error("================ ERROR ===============");
    console.error(e.stack);
  }
  
  process.exit(0);
}

run();
