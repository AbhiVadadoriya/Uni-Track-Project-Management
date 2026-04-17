import express, { request } from "express";
import {acceptRequest, addFeedback, downloadFile, getAssignedStudents, getFiles, getProfessorDashboardStats, getRequests, markComplete, rejectRequest} from "../controllers/professorController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddlewares.js";



const router = express.Router();


router.get("/fetch-dashboard-stats",isAuthenticated,isAuthorized("Professor"),getProfessorDashboardStats);

router.get("/requests",isAuthenticated,isAuthorized("Professor"),getRequests);

router.put("/requests/:requestId/accept", isAuthenticated, isAuthorized("Professor"), acceptRequest);
router.put("/requests/:requestId/reject", isAuthenticated, isAuthorized("Professor"), rejectRequest);
router.post("/feedback/:projectId",isAuthenticated,isAuthorized("Professor"),addFeedback);

router.post("/mark-complete/:projectId",isAuthenticated,isAuthorized("Professor"),markComplete);
router.get("/assigned-students",isAuthenticated,isAuthorized("Professor"),getAssignedStudents);

router.get("/download/:projectId/:fileId", isAuthenticated, isAuthorized("Professor"), downloadFile);

router.get("/files", isAuthenticated, isAuthorized("Professor"), getFiles);





export default router;
