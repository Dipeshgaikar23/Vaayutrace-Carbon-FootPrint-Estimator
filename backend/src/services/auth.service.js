import { createUser, findUserByEmail } from "../dao/user.dao.js";
import { generateToken } from "../utils/generate.token.js";

export const registerUserService = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new Error("User already exists");

  const newUser = await createUser({ name, email, password });
  const token = generateToken(newUser._id);

  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    token,
  };
};

export const loginUserService = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = generateToken(user._id);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token,
  };
};
