import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log("=> using existing database connection");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "myDatabase"
        });
        isConnected = db.connections[0].readyState === 1;
        console.log("Database connected successfully");
    } catch (err) {
        console.log("Database connection failed", err);
    }
};