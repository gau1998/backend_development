import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with credentials from environment variables
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

/**
 * Uploads a file to Cloudinary and deletes it locally afterwards.
 * 
 * @param {string} localFilePath - The path of the file stored temporarily on the server.
 * @returns {object|null} - Returns the Cloudinary upload response object if successful, otherwise null.
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // If no file path is provided, return null
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // auto-detects file type (image, video, pdf, etc.)
    });

    // File uploaded successfully
    // Clean up: remove the file from local storage after upload
    fs.unlinkSync(localFilePath);

    // Return Cloudinary response (contains URL, public_id, etc.)
    return response;

  } catch (error) {
    // If upload fails, ensure local file is deleted to prevent unnecessary storage
    fs.unlinkSync(localFilePath);

    // Return null to indicate failure
    return null;
  }
};

export { uploadOnCloudinary };
