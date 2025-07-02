import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// Main authentication middleware
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from multiple sources for flexibility
    const token =
      req.cookies?.accessToken || // First try cookies (secure for web apps)
      req.header("Authorization")?.replace("Bearer ", ""); // Then try Authorization header (good for APIs/mobile)

    // Check if token exists
    if (!token) {
      throw new ApiError(401, "Unauthorized request - No token provided");
    }

    // Verify the JWT token

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Fetch user from database (excludes password and refreshToken for security)
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    // Check if user still exists (user might have been deleted)
    if (!user) {
      throw new ApiError(401, "Invalid access token - User not found");
    }

    // Attach user to request object for use in subsequent middleware/controllers
    req.user = user;

    next();
  } catch (error) {
    // Re-throw ApiError instances (preserves status codes and messages)
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle any unexpected errors
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export default {
  verifyJWT,
};
