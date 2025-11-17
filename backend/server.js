import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// routes
import adminRoutes from "./routes/admin.route.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true, 
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/admin", adminRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
