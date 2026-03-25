import { sendResponse } from "../utils/response.js";

const notFound = (req, res) => {
  return sendResponse(res, 404, "Route not found.", {});
};

export default notFound;
