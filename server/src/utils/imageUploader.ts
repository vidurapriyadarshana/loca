import { uploadToCloudinary } from "../config/cloudinary.config";
import { UploadedFile } from "../types/image.types";

export const imageUploader = async (file: UploadedFile): Promise<string> => {
  const imageUrl = await uploadToCloudinary(file);
  return imageUrl;
};
