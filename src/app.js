import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // Parse JSON request bodies, limit size to 16kbhandled
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parse URL-encoded form data, limit size to 16kb
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter); //standard practice

export { app };
