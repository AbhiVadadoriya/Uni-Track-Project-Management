import express from "express";
import {createDeadline, getAllDeadlines } from "../controllers/deadlineController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddlewares.js";



const router = express.Router();



// Get all deadlines (public or restrict as needed)
router.get("/", getAllDeadlines);

router.post("/create-deadline/:id", isAuthenticated, isAuthorized("Admin"), createDeadline);



export default router;