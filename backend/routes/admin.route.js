import express from "express";
import { verifyFirebaseToken } from "../controller/auth.controller.js";
import { getAllUsers } from "../controller/user.controller.js";

const router = express.Router();

// Verify token sent from frontend and return admin info
router.post("/auth", verifyFirebaseToken);

// Get all users
router.get("/users", getAllUsers);

export default router;
