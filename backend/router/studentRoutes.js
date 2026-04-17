import express from "express";
import { downloadFile, getAvailableSupervisors, getDashboardStats, getfeedback, getStudentProject, getSupervisor, requestSupervisor, submitProposal, uploadFiles } from "../controllers/StudentControllers.js";
import multer from "multer";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddlewares.js";
import { getAllUsers } from "../services/userService.js";
import { handleUploadError, upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/project", isAuthenticated, isAuthorized("Student", "Admin"), getStudentProject);

router.post("/project-proposal", isAuthenticated, isAuthorized("Student", "Admin"), submitProposal);

router.post("/upload/:projectId", isAuthenticated, isAuthorized("Student", "Admin"), 
upload.array("files",10),
handleUploadError,
uploadFiles);

router.get("/fetch-supervisors", isAuthenticated, isAuthorized("Student", "Admin"), getAvailableSupervisors);
router.get("/supervisor", isAuthenticated, isAuthorized("Student", "Admin"), getSupervisor);

router.post("/request-supervisor", isAuthenticated, isAuthorized("Student", "Admin"), requestSupervisor);

router.get("/feedback/:projectId", isAuthenticated, isAuthorized("Student"),getfeedback);
router.get("/fetch-dashboard-stats",isAuthenticated,isAuthorized("Student"),getDashboardStats);
router.get("/download/:projectId/:fileId",isAuthenticated,isAuthorized("Student"),downloadFile);

 

// router.get("/users", isAuthenticated, isAuthorized("Admin"), getAllUsers);

export default router;
