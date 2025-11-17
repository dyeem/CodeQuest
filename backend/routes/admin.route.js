import express from "express";
import { adminLogin, getCurrentAdmin } from "../controller/auth.controller.js";
import { verifyToken } from "../utils/auth.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/me", verifyToken, getCurrentAdmin);
export default router;