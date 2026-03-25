import { Router } from "express";
import { getAppStats } from "../controllers/statsController.js";
import { statsRules, validate } from "../validators/counterValidators.js";

const router = Router();

router.get("/", statsRules, validate, getAppStats);

export default router;
