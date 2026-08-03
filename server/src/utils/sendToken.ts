import { Response } from "express";
import { IUser } from "../models/User.js";
import { generateToken } from "./generateToken.js";

export const sendToken = (
  user: IUser,
  statusCode: number,
  res: Response
): void => {
  const token = generateToken(user._id.toString());

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};