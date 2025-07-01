import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "nkal",
  });
});

export { registerUser };

const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "ok",
  });
});

export { loginUser };
