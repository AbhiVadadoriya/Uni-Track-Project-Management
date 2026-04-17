import { config } from "dotenv";
import mongoose from "mongoose";

config();

export async function connectDb() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set in environment variables.");
  }

  await mongoose.connect(mongoUri, { dbName: "myDatabase" });
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
