import * as authService from "../services/authService.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";
import { COOKIE_OPTIONS } from "../config/constants.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { token, user } = await authService.registerUser(
      name,
      email,
      password
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    return successResponse(res, 201, "Account created successfully", { user });
  } catch (error) {
    return errorResponse(
      res,
      error.message.includes("already exists") ? 409 : 500,
      error.message
    );
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.loginUser(email, password);

    res.cookie("token", token, COOKIE_OPTIONS);
    return successResponse(res, 200, "Login successful", { user });
  } catch (error) {
    return errorResponse(
      res,
      error.message.includes("Invalid") ? 401 : 500,
      error.message
    );
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return successResponse(res, 200, "Logged out successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user._id);
    return successResponse(res, 200, "Profile fetched", { user: profile });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const checkAuth = async (req, res) => {
  try {
    return successResponse(res, 200, "Authenticated", {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};