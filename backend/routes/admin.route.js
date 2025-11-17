import express from "express";
import { verifyFirebaseToken } from "../controller/auth.controller.js";

const router = express.Router();

// Verify token sent from frontend and return admin info
router.post("/auth", verifyFirebaseToken);

export default router;
