import { sendResponse } from "../utils/response.js";

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error.";

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return sendResponse(res, statusCode, message, {});
};

export default errorHandler;
