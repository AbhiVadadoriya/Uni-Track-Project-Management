import app from '../backend/app.js';
import { connectDB } from '../backend/config/db.js';

// Connect to the database on cold start
connectDB();

// Export the Express app as a module for Vercel Serverless Function
export default app;
