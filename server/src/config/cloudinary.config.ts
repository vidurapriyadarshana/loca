import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "./env.config";
import { ApiError } from "../utils/ApiError";
import * as streamifier from "streamifier";
import { UploadedFile } from "../types/image.types";

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

export const uploadToCloudinary = (
  file: UploadedFile
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "images",
        resource_type: "image",
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(new ApiError(500, "Image upload failed", [error]));
        }
        if (!result) {
          return reject(new ApiError(500, "Image upload failed to return result"));
        }
        // This resolves the promise with the URL string
        resolve(result.secure_url);
      }
    );

    // Convert buffer to readable stream and pipe to Cloudinary
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};