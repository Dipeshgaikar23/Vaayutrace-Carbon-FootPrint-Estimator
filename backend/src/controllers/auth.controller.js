import { registerUserService, loginUserService } from "../services/auth.service.js";
import { cookieOptions } from "../config/config.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const userData = await registerUserService({ name, email, password });
    res.cookie("token", userData.token, cookieOptions);
    res.status(201).json(userData);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password)
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const userData = await loginUserService({ email, password });

    // Create cookie
    res.cookie("token", userData.token, cookieOptions);

    res.json({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      message: "Logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = (req, res, next) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", cookieOptions);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// ADD THIS FUNCTION
export const verifyUser = async (req, res, next) => {
  try {
    // req.user is already set by the protect middleware
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (error) {
    next(error);
  }
};