import { body, param, query, validationResult } from "express-validator";
import ApiError from "../utils/apiError.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const first = errors.array({ onlyFirstError: true })[0];
  return next(new ApiError(400, first.msg));
};

const baseTitleValidation = body("title")
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage("title must be between 2 and 50 characters.");

const baseGoalValidation = body("dailyGoal")
  .isInt({ min: 1 })
  .withMessage("dailyGoal must be an integer greater than or equal to 1.");

const baseCurrentValueValidation = body("currentValue")
  .optional()
  .isInt({ min: 0 })
  .withMessage("currentValue must be an integer greater than or equal to 0.");

const baseDeviceIdBodyValidation = body("deviceId")
  .trim()
  .notEmpty()
  .withMessage("deviceId is required.");

const baseDeviceIdQueryValidation = query("deviceId")
  .trim()
  .notEmpty()
  .withMessage("deviceId is required.");

const baseCounterIdValidation = param("id")
  .isMongoId()
  .withMessage("Counter id must be a valid MongoDB ObjectId.");

export const createCounterRules = [
  baseDeviceIdBodyValidation,
  baseTitleValidation,
  body("icon").trim().notEmpty().withMessage("icon is required."),
  body("color").trim().notEmpty().withMessage("color is required."),
  baseGoalValidation,
  baseCurrentValueValidation,
];

export const updateCounterRules = [
  baseCounterIdValidation,
  baseDeviceIdBodyValidation,
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("title must be between 2 and 50 characters."),
  body("icon").optional().trim().notEmpty().withMessage("icon cannot be empty."),
  body("color")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("color cannot be empty."),
  body("dailyGoal")
    .optional()
    .isInt({ min: 1 })
    .withMessage("dailyGoal must be an integer greater than or equal to 1."),
  body("currentValue")
    .optional()
    .isInt({ min: 0 })
    .withMessage("currentValue must be an integer greater than or equal to 0."),
];

export const listCountersRules = [baseDeviceIdQueryValidation];

export const getCounterRules = [baseCounterIdValidation, baseDeviceIdQueryValidation];

export const deleteCounterRules = [baseCounterIdValidation, baseDeviceIdQueryValidation];

export const mutateCounterRules = [
  baseCounterIdValidation,
  baseDeviceIdBodyValidation,
  body("amount")
    .optional()
    .isInt({ min: 1 })
    .withMessage("amount must be an integer greater than or equal to 1."),
];

export const counterHistoryRules = [
  baseCounterIdValidation,
  baseDeviceIdQueryValidation,
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100."),
];

export const statsRules = [baseDeviceIdQueryValidation];
