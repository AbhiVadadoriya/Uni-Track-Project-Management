import express from "express";
import {RegisterUser,forgotPassword,resetPassword,getUser,login,logout} from "../controllers/authController.js";
import multer from "multer";
import { isAuthenticated } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/register", RegisterUser);
router.post("/login", login);
router.get("/me",isAuthenticated, getUser);
router.get("/logout",isAuthenticated, logout);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);


export default router;

