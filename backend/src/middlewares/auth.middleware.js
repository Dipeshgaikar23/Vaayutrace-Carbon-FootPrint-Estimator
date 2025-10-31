import jwt from "jsonwebtoken";
import { findUserById } from "../dao/user.dao.js";

export const protect = async (req, res, next) => {
  let token;

  // ✅ Check cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // or fallback to Authorization header
  else if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await findUserById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
