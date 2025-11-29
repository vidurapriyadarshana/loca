import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import * as imageService from "../services/image.service";

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const saveImageAndGetUrl = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Upload image and get URL from service
    const imageUrl = await imageService.uploadImage(req.file);

    // Send the successful response
    res.status(201).json(
      new ApiResponse(
        201,
        { url: imageUrl },
        "Image uploaded successfully"
      )
    );
  }
);