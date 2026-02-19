import TransportRecord from "../models/TransportRecord.js";

export const createTransportRecord = async (recordData) => {
  const record = new TransportRecord(recordData);
  return await record.save();
};

export const getUserTransportRecords = async (userId, limit = null) => {
  let query = TransportRecord.find({ userId }).sort({ dateFrom: 1 }).lean();
  if (limit) query = query.limit(limit);
  return await query;
};

export const getUserTransportRecordCount = async (userId) => {
  return await TransportRecord.countDocuments({ userId });
};

export const deleteTransportRecord = async (recordId, userId) => {
  return await TransportRecord.findOneAndDelete({
    _id: recordId,
    userId,
  });
};

export const getTransportRecordsByDateRange = async (
  userId,
  startDate,
  endDate
) => {
  return await TransportRecord.find({
    userId,
    dateFrom: { $gte: startDate },
    dateTo: { $lte: endDate },
  }).sort({ dateFrom: 1 }).lean();
};