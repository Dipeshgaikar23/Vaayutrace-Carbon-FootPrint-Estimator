import * as userDao from "../dao/userDao.js";
import { generateToken } from "../config/jwt.js";
import { COOKIE_OPTIONS } from "../config/constants.js";

export const registerUser = async (name, email, password) => {
  const existingUser = await userDao.findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const user = await userDao.createUser({ name, email, password });
  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

export const loginUser = async (email, password) => {
  const user = await userDao.findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

export const getProfile = async (userId) => {
  const user = await userDao.findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};