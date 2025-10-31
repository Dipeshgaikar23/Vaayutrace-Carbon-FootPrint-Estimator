import { getFootprintsByUser } from "../dao/footprint.dao.js";

// 🔒 Get history for logged-in user
export const getHistory = async (req, res, next) => {
  try {
    const footprints = await getFootprintsByUser(req.user._id);
    res.json(footprints);
  } catch (error) {
    next(error);
  }
};