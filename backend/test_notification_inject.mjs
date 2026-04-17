import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Notification } from './models/notification.js';
import { User } from './models/user.js';
config({ path: '.env' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/myDatabase");
  
  try {
      const student = await User.findOne({ name: /abhi/i });
      if (!student) return console.log("Student not found!");

      console.log(`Injecting sample notifications for: ${student.name}`);

      await Notification.create([
          {
             user: student._id,
             message: "Your project proposal has been REJECTED by Professor Alan due to incomplete requirements. Please submit a new one.",
             type: "rejection",
             priority: "high",
             isRead: false,
          },
          {
             user: student._id,
             message: "Weekly project update has been scheduled for tomorrow.",
             type: "general",
             priority: "low",
             isRead: false,
          },
          {
             user: student._id,
             message: "Your chapter 1 feedback has arrived. Review it now.",
             type: "feedback",
             priority: "medium",
             isRead: true,
          }
      ]);

      console.log("Mock notifications successfully inserted into DB!");
  } catch (err) {
      console.error("Backend DB Error:", err);
  }

  process.exit(0);
}
run();
