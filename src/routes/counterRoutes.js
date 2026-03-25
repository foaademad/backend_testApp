import { Router } from "express";
import {
  createCounter,
  getAllCounters,
  getCounterById,
  updateCounter,
  deleteCounter,
  incrementCounter,
  decrementCounter,
  getCounterHistory,
  resetCounter,
} from "../controllers/counterController.js";
import {
  counterHistoryRules,
  createCounterRules,
  deleteCounterRules,
  getCounterRules,
  listCountersRules,
  mutateCounterRules,
  updateCounterRules,
  validate,
} from "../validators/counterValidators.js";

const router = Router();

router.post("/", createCounterRules, validate, createCounter);
router.get("/", listCountersRules, validate, getAllCounters);
router.get("/:id", getCounterRules, validate, getCounterById);
router.put("/:id", updateCounterRules, validate, updateCounter);
router.delete("/:id", deleteCounterRules, validate, deleteCounter);
router.patch("/:id/increment", mutateCounterRules, validate, incrementCounter);
router.patch("/:id/decrement", mutateCounterRules, validate, decrementCounter);
router.patch("/:id/reset", mutateCounterRules, validate, resetCounter);
router.get("/:id/history", counterHistoryRules, validate, getCounterHistory);

export default router;
