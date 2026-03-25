import Counter from "../models/Counter.js";
import CounterHistory from "../models/CounterHistory.js";
import Device from "../models/Device.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { sendResponse } from "../utils/response.js";
import { getTodayDateString } from "../utils/dateUtils.js";

const ensureDevice = async (deviceId) => {
  await Device.findOneAndUpdate(
    { deviceId },
    { $setOnInsert: { deviceId } },
    { upsert: true, new: true }
  );
};

const mapCounter = (counter) => ({
  id: counter._id.toString(),
  deviceId: counter.deviceId,
  title: counter.title,
  icon: counter.icon,
  color: counter.color,
  dailyGoal: counter.dailyGoal,
  currentValue: counter.currentValue,
  isArchived: counter.isArchived,
  createdAt: counter.createdAt,
  updatedAt: counter.updatedAt,
});

const getOwnedCounter = async (counterId, deviceId) => {
  const counter = await Counter.findOne({ _id: counterId, deviceId });
  if (!counter) {
    throw new ApiError(404, "Counter not found for this device.");
  }
  return counter;
};

const upsertTodayHistory = async (counter) => {
  const today = getTodayDateString();
  return CounterHistory.findOneAndUpdate(
    {
      counterId: counter._id,
      deviceId: counter.deviceId,
      date: today,
    },
    {
      $set: {
        value: counter.currentValue,
        goal: counter.dailyGoal,
        completed: counter.currentValue >= counter.dailyGoal,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

export const createCounter = asyncHandler(async (req, res) => {
  const { deviceId, title, icon, color, dailyGoal } = req.body;
  const currentValue = Number(req.body.currentValue ?? 0);

  await ensureDevice(deviceId);

  const counter = await Counter.create({
    deviceId,
    title,
    icon,
    color,
    dailyGoal: Number(dailyGoal),
    currentValue,
    isArchived: false,
  });

  await upsertTodayHistory(counter);

  return sendResponse(res, 201, "Counter created successfully.", mapCounter(counter));
});

export const getAllCounters = asyncHandler(async (req, res) => {
  const { deviceId } = req.query;
  await ensureDevice(deviceId);

  const counters = await Counter.find({ deviceId, isArchived: false }).sort({
    createdAt: -1,
  });

  return sendResponse(
    res,
    200,
    "Counters fetched successfully.",
    counters.map(mapCounter)
  );
});

export const getCounterById = asyncHandler(async (req, res) => {
  const { deviceId } = req.query;
  const { id } = req.params;

  await ensureDevice(deviceId);
  const counter = await getOwnedCounter(id, deviceId);

  return sendResponse(res, 200, "Counter fetched successfully.", mapCounter(counter));
});

export const updateCounter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deviceId, title, icon, color, dailyGoal, currentValue, isArchived } = req.body;

  await ensureDevice(deviceId);
  const counter = await getOwnedCounter(id, deviceId);

  if (title !== undefined) counter.title = title;
  if (icon !== undefined) counter.icon = icon;
  if (color !== undefined) counter.color = color;
  if (dailyGoal !== undefined) counter.dailyGoal = Number(dailyGoal);
  if (currentValue !== undefined) counter.currentValue = Math.max(0, Number(currentValue));
  if (isArchived !== undefined) counter.isArchived = Boolean(isArchived);

  await counter.save();
  await upsertTodayHistory(counter);

  return sendResponse(res, 200, "Counter updated successfully.", mapCounter(counter));
});

export const deleteCounter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deviceId } = req.query;

  await ensureDevice(deviceId);
  const counter = await getOwnedCounter(id, deviceId);

  await CounterHistory.deleteMany({ counterId: counter._id, deviceId });
  await counter.deleteOne();

  return sendResponse(res, 200, "Counter deleted successfully.", {});
});

const mutateCounterValue = async (req, operation) => {
  const { id } = req.params;
  const { deviceId } = req.body;
  const amount = Number(req.body.amount ?? 1);

  await ensureDevice(deviceId);
  const counter = await getOwnedCounter(id, deviceId);

  if (operation === "increment") {
    counter.currentValue += amount;
  } else if (operation === "decrement") {
    counter.currentValue = Math.max(0, counter.currentValue - amount);
  } else {
    counter.currentValue = 0;
  }

  await counter.save();
  await upsertTodayHistory(counter);
  return counter;
};

export const incrementCounter = asyncHandler(async (req, res) => {
  const counter = await mutateCounterValue(req, "increment");
  return sendResponse(res, 200, "Counter incremented successfully.", mapCounter(counter));
});

export const decrementCounter = asyncHandler(async (req, res) => {
  const counter = await mutateCounterValue(req, "decrement");
  return sendResponse(res, 200, "Counter decremented successfully.", mapCounter(counter));
});

export const resetCounter = asyncHandler(async (req, res) => {
  const counter = await mutateCounterValue(req, "reset");
  return sendResponse(res, 200, "Counter reset successfully.", mapCounter(counter));
});

export const getCounterHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deviceId } = req.query;
  const limit = Number(req.query.limit ?? 30);

  await ensureDevice(deviceId);
  await getOwnedCounter(id, deviceId);

  const history = await CounterHistory.find({
    counterId: id,
    deviceId,
  })
    .sort({ date: -1 })
    .limit(limit);

  return sendResponse(res, 200, "Counter history fetched successfully.", history);
});
