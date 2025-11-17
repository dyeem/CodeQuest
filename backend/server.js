import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.route.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use("/api/admin", adminRoutes);

app.listen(process.env.PORT || 5000, () =>
  console.log("Backend running on port", process.env.PORT || 5000)
);
