import ElectricityRecord from "../models/ElectricityRecord.js";

export const createElectricityRecord = async (recordData) => {
  const record = new ElectricityRecord(recordData);
  return await record.save();
};

export const getUserElectricityRecords = async (userId, limit = null) => {
  let query = await ElectricityRecord.find({ userId }).sort({ dateFrom: 1 }).lean()
  if (limit) query = query.limit(limit);
  return query;
};

export const getUserElectricityRecordCount = async (userId) => {
  return await ElectricityRecord.countDocuments({ userId });
};

export const deleteElectricityRecord = async (recordId, userId) => {
  return await ElectricityRecord.findOneAndDelete({
    _id: recordId,
    userId,
  });
};

export const getElectricityRecordsByDateRange = async (
  userId,
  startDate,
  endDate
) => {
  return await ElectricityRecord.find({
    userId,
    dateFrom: { $gte: startDate },
    dateTo: { $lte: endDate },
  }).sort({ dateFrom: 1 }).lean();
};