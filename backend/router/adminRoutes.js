import express from "express";
import { createAdmin, createProfessor, createStudent, deleteAdmin, deleteProfessor, deleteStudent, getAllAdmins, getAllProjects, getDashboardStats, getProject, updateAdmin, updateProfessor, updateStudent, updateProjectStatus } from "../controllers/adminController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddlewares.js";
import { getAllUsers } from "../services/userService.js";
import { assignSupervisor } from "../controllers/adminController.js";



const router = express.Router();

router.post("/create-student", isAuthenticated, isAuthorized("Admin"), createStudent);

router.put("/update-student/:id", isAuthenticated, isAuthorized("Admin"), updateStudent);

router.delete("/delete-student/:id", isAuthenticated, isAuthorized("Admin"), deleteStudent);

router.post("/create-professor", isAuthenticated, isAuthorized("Admin"), createProfessor);

router.post("/create-admin", isAuthenticated, isAuthorized("Admin"), createAdmin);

router.put("/update-admin/:id", isAuthenticated, isAuthorized("Admin"), updateAdmin);

router.delete("/delete-admin/:id", isAuthenticated, isAuthorized("Admin"), deleteAdmin);

router.put("/update-professor/:id", isAuthenticated, isAuthorized("Admin"), updateProfessor);

router.delete("/delete-professor/:id", isAuthenticated, isAuthorized("Admin"), deleteProfessor);

router.get("/projects", isAuthenticated, isAuthorized("Admin"),getAllProjects);

router.get("/fetch-dashboard-stats", isAuthenticated, isAuthorized("Admin"), getDashboardStats);

router.get("/users", isAuthenticated, isAuthorized("Admin"), async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json({ success: true, data:users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }                       
});

router.get("/admins", isAuthenticated, isAuthorized("Admin"), getAllAdmins);

router.post("/assign-supervisor", isAuthenticated, isAuthorized("Admin"), assignSupervisor)

router.get("/project/:id", isAuthenticated, isAuthorized("Admin"), getProject);

router.put("/project/:id", isAuthenticated, isAuthorized("Admin"), updateProjectStatus);


// router.get("/users", isAuthenticated, isAuthorized("Admin"), getAllUsers);

export default router;
