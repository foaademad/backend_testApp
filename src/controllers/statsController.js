import Counter from "../models/Counter.js";
import CounterHistory from "../models/CounterHistory.js";
import Device from "../models/Device.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getTodayDateString } from "../utils/dateUtils.js";
import { sendResponse } from "../utils/response.js";

const ensureDevice = async (deviceId) => {
  await Device.findOneAndUpdate(
    { deviceId },
    { $setOnInsert: { deviceId } },
    { upsert: true, new: true }
  );
};

export const getAppStats = asyncHandler(async (req, res) => {
  const { deviceId } = req.query;
  const today = getTodayDateString();

  await ensureDevice(deviceId);

  const [totalCounters, todayHistory] = await Promise.all([
    Counter.countDocuments({ deviceId, isArchived: false }),
    CounterHistory.find({ deviceId, date: today }),
  ]);

  const completedToday = todayHistory.filter((row) => row.completed).length;
  const totalCountToday = todayHistory.reduce((sum, row) => sum + row.value, 0);

  return sendResponse(res, 200, "App statistics fetched successfully.", {
    totalCounters,
    completedToday,
    totalCountToday,
  });
});
