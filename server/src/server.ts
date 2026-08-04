import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import noteRoutes from "./routes/noteRoutes.js";

import { connectDatabase } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "KnowFlow API is running",
  });
});

// Start Server
const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`KnowFlow API running on http://localhost:${PORT}`);
  });
};

startServer();