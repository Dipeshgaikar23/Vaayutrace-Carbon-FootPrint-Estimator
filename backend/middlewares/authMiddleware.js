import { verifyToken } from "../config/jwt.js";
import { findUserById } from "../dao/userDao.js";
import { errorResponse } from "../utils/responseUtils.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return errorResponse(res, 401, "Not authorized. Please login.");
    }

    const decoded = verifyToken(token);
    const user = await findUserById(decoded.id);

    if (!user) {
      return errorResponse(res, 401, "User not found. Please login again.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Invalid token. Please login again.");
    }
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Token expired. Please login again.");
    }
    return errorResponse(res, 500, "Authentication error.");
  }
};

// Optional auth - doesn't block if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = verifyToken(token);
      const user = await findUserById(decoded.id);
      req.user = user || null;
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};