import Footprint from "../models/Footprint.js";

export const saveFootprint = async (data) => {
  const footprint = new Footprint(data);
  return await footprint.save();
};

export const getAllFootprints = async () => {
  return await Footprint.find().sort({ createdAt: -1 });
};

export const getFootprintsByCategory = async (category) => {
  return await Footprint.find({ category }).sort({ createdAt: -1 });
};

export const deleteFootprint = async (id) => {
  return await Footprint.findByIdAndDelete(id);
};

export const getFootprintsByUser = async (userId) => {
  return await Footprint.find({ user: userId }).sort({ createdAt: -1 });
};