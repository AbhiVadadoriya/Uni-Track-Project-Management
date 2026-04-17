import express from 'express';
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

      console.log(`Testing notifications for user: ${student.name} (${student._id})`);

      let query = { user: student._id };
      const notifications = await Notification.find(query).sort({createdAt: -1});

      console.log(`Found ${notifications.length} notifications!`);
      notifications.forEach((n, i) => {
         console.log(`[${i}] ID: ${n._id} | isRead: ${n.isRead} | Type: ${n.type} | Msg: ${n.message}`);
      });
  } catch (err) {
      console.error("Backend DB Error:", err);
  }

  process.exit(0);
}
run();
