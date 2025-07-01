import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

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
router.route("/login").post(loginUser);

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
