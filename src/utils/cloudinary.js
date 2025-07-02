import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { console } from "inspector";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    // console.log("file is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    try {
      fs.unlinkSync(localFilePath); // remove the locally saved temp files as the upload operation gets failed
    } catch (unlinkErr) {
      console.error("Failed to delete lcoal file:", unlinkErr);
    }
    console.error("cloudinary upload failed:", error);
    return null;
  }
};

export { uploadOnCloudinary };
