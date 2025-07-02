import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// User registration route with file upload (avatar and cover image)
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

// User login route (no authentication required)
router.route("/login").post(loginUser);

// User logout route (protected, requires authentication)
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

export default router;

/*
Summary Table:
HTTP Method	    Typical Use Case	        Example
GET	            Retrieve data	            Get user profile
POST	        Create new data             Register new user
PUT/PATCH	    Update existing data	    Update user profile
DELETE	        Remove data	                Delete user account

POST is used for creating new resources (like a new user) on the server.

*/
