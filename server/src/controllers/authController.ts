import { Request, Response } from "express";
import User from "../models/User.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { sendToken } from "../utils/sendToken.js";
import { verifyGoogleIdToken } from "../services/googleAuthService.js";


// ==========================
// Register User
// ==========================
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    sendToken(user, 201, res);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Login User
// ==========================
export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    sendToken(user, 200, res);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get Current User
// ==========================
export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// ==========================
// Logout User
// ==========================
export const logoutUser = async (
  _req: Request,
  res: Response
): Promise<void> => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Google Login
export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
      return;
    }

    const googleUser = await verifyGoogleIdToken(credential);

    let user = await User.findOne({
      googleId: googleUser.googleId,
    });

    // If Google account is not linked yet, try matching the email.
    if (!user) {
      user = await User.findOne({
  email: googleUser.email,
}).select("+password");

      if (user) {
        user.googleId = googleUser.googleId;
       user.authProvider = user.password ? "both" : "google";
        user.isVerified = true;

        if (googleUser.picture && !user.avatar) {
          user.avatar = googleUser.picture;
        }

        await user.save();
      }
    }

    // Create a new Google user.
    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        authProvider: "google",
        avatar: googleUser.picture || "",
        isVerified: true,
      });
    }

    sendToken(user, 200, res);
  } catch (error) {
    console.error("Google login error:", error);

    res.status(401).json({
      success: false,
      message: "Unable to sign in with Google",
    });
  }
};