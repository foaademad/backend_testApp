import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import counterRoutes from "./routes/counterRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";
import swaggerDocument from "./swagger.js";
import { sendResponse } from "./utils/response.js";

const app = express();
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "256kb" }));
app.use(morgan("dev"));
app.use("/api", apiLimiter);

app.get("/health", (req, res) => {
  return sendResponse(res, 200, "Service is healthy.", {
    status: "ok",
  });
});

app.get("/api-docs.json", (req, res) => {
  return res.status(200).json(swaggerDocument);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1/counters", counterRoutes);
app.use("/api/v1/stats", statsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
