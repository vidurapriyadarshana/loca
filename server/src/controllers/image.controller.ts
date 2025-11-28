import { Request, Response } from "express";
import { BadRequestError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { imageUploader } from "../utils/imageUploader";

const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<any>
) => {
  return (req: Request, res: Response, next: any) => {
    fn(req, res).catch(next);
  };
};

export const saveImageAndGetUrl = asyncHandler(
  async (req: Request, res: Response) => {
    // 1. Check if a file was attached by Multer
    if (!req.file) {
      throw new BadRequestError("No image file provided.");
    }

    // 2. Pass the file to the service
    const imageUrl = await imageUploader(req.file);

    // 3. Send the successful response
    res.status(201).json(
      new ApiResponse(
        201,
        { url: imageUrl }, // Send URL in data object
        "Image uploaded successfully"
      )
    );
  }
);