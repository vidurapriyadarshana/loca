import { uploadToCloudinary } from "../config/cloudinary.config";
import { UploadedFile } from "../types/image.types";
import { BadRequestError } from "../utils/ApiError";

/**
 * Validate uploaded file
 */
const validateImageFile = (file: UploadedFile | undefined) => {
  if (!file) {
    throw new BadRequestError("No image file provided.");
  }

  // Additional validation can be added here
  // e.g., file size, mime type, etc.
};

/**
 * Upload image to Cloudinary and return URL
 */
export const uploadImage = async (file: UploadedFile | undefined): Promise<string> => {
  validateImageFile(file);
  
  const imageUrl = await uploadToCloudinary(file!);
  return imageUrl;
};
