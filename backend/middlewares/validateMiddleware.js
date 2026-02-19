import { validationResult } from "express-validator";
import { errorResponse } from "../utils/responseUtils.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return errorResponse(res, 400, "Validation failed", extractedErrors);
  }
  next();
};