// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
// import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/db_connect.js";

dotenv.config({
  path: "./env",
});

connectDB();

// 1st approach to connect db
/*
import express from "express";
const app = express();

app.on("error", (error) => {
  console.log("express app error:", error);
  throw error;
});

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("MongoDb connection Error:", error);
    throw error;
  }
})();
*/
