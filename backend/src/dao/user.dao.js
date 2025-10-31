import User from "../models/user.js";

export const createUser = async (data) => {
  const user = new User(data);
  return await user.save();
};

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findUserById = async (id) => {
  return await User.findById(id).select("-password"); // omit password
};
