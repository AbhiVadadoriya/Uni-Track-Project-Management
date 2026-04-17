import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
//  import { connectDB } from './config/db.js';
import { errorMiddleware } from './middlewares/error.js';
import authRouter from './router/userRoutes.js';
import adminRouter from './router/adminRoutes.js';
import studentRouter from './router/studentRoutes.js';
import notificationRouter from './router/notificationRoutes.js';
import projectRouter from './router/projectRoutes.js';
import deadlineRouter from './router/deadlineRoutes.js';
import professorRouter from './router/professorRoutes.js';
import {fileURLToPath} from "url";
import path from "path";
import fs from "fs";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: function(origin, callback) {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || origin === process.env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

const uploadsDir = path.join(__dirname, "uploads");
const tempDir = path.join(__dirname, "temp");

if(!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, {recursive: true});
if(!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, {recursive: true});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/project",projectRouter);
app.use("/api/v1/deadline", deadlineRouter);
app.use("/api/v1/professor", professorRouter);

// Root route to prevent 'Cannot GET /' error
// app.get('/', (req, res) => {
//     res.send('API is running');
// });

app.use(errorMiddleware)
export default app;