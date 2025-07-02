import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Utility function to generate and store JWT tokens for a user
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find user by ID
    const user = await User.findById(userId);

    // Generate JWT access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token in DB for session management
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return both tokens
    return { accessToken, refreshToken };
  } catch (error) {
    // Handle errors in token generation
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

// Registering the user ✅✅✅
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { fullName, email, username, password } = req.body;

  // validation - not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  // check if user already exists : username, email
  const existedUser = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already existed");
  }

  // Log uploaded files for debugging
  console.log(req.files);

  // check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // Optional: check for cover image
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar files is required");
  }

  // upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar files is required");
  }

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // here we check if coverImage url exist? if not keep it empty
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check if user was created successfully
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// Logging in User ✅✅✅
const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email based login
  // find the user
  // password check
  // access and refresh token generate
  // send secure cookie

  const { email, username, password } = req.body;

  // Validate that either username or email is provided
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  // Generate and save tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Remove sensitive fields from user object for response
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Cookie options for security
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Send tokens as cookies and user info in response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse( // from this line to 152 its structure of Apiresponse file
        200,
        {
          user: loggedInUser, // this is data field from ApiResponse
          accessToken,
          refreshToken,
        },
        "User logged in Successfully" // this is message field
      )
    );
});

//Logging out user✅✅✅
const logoutUser = asyncHandler(async (req, res) => {
  // Remove refresh token from user in the database (server-side logout)
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        // MongoDB $set operator to clear refreshToken field
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  // Cookie options for security (httpOnly: not accessible by JS, secure: HTTPS only)
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Clear authentication cookies and send success response
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out Successfully"));
});

// Refreshing the tokens ✅✅✅

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookies or request body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // If no refresh token is provided, deny the request
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // Verify the refresh token using JWT
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user associated with the refresh token
    const user = await User.findById(decodedToken?._id);

    // If user does not exist, token is invalid
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    // Check if the refresh token matches the one stored in the database
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expire or used");
    }

    // Cookie options for security
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Generate new access and refresh tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // Send new tokens as cookies and in the response body
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    // Handle invalid or expired refresh token
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

// Change Password ✅✅✅
const changeCurrentPassword = asyncHandler(async (req, res) => {
  // Destructure old, new, and confirm password from request body
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // Check if new password and confirm password match
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password does not match");
  }

  // Find user by ID from the authenticated request
  const user = await User.findById(req.user?._id);

  // Check if the old password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }

  // Update user's password and save to database
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  // Send success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

// Get current logged-in user's info ✅✅✅
const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user is already set by authentication middleware (verifyJWT)
  // No need to fetch from database again as middleware provides sanitized user data
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// Update account details ✅✅✅
const updateAccountDetails = asyncHandler(async (req, res) => {
  // Extract fullName and email from request body
  const { fullName, email } = req.body;

  // Validate that both fields are provided
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  // Update user's account details in database
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true } // Return updated document
  ).select("-password"); // Exclude password from response

  // Send success response with updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account detail Updated Successfully"));
});

// Update user avatar ✅✅✅
const updateUserAvatar = asyncHandler(async (req, res) => {
  // Get uploaded avatar file path from Multer middleware
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Upload avatar image to Cloudinary storage
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  // Update user's avatar URL in database
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url }, // Set new avatar URL
    },
    { new: true } // Return updated document
  ).select("-password"); // Exclude password from response

  // Send success response with updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Updated Successfully"));
});

// update user cover Image ✅✅✅
const updateUserCoverImage = asyncHandler(async (req, res) => {
  // Get uploaded cover image file path from Multer middleware
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image is missing");
  }

  // Upload cover image to Cloudinary storage
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading cover Image");
  }

  // Update user's cover image URL in database
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { coverImage: coverImage.url }, // Set new cover image URL
    },
    { new: true } // Return updated document
  ).select("-password"); // Exclude password from response

  // Send success response with updated user data
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Updated Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
