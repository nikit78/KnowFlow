import { Router } from "express";

import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} from "../controllers/authController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/me", isAuthenticated, getMe);

router.post("/logout", logoutUser);

export default router;