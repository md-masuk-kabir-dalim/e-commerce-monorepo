import express from "express";
import { upload } from "../../middlewares/upload ";
import { validateMaliciousFile } from "../../middlewares/validateFile";
import { ImageController } from "./image.controller";

const router = express.Router();

router.post(
  "/upload",
  upload.single("file"),
  validateMaliciousFile,
  ImageController.uploadImage,
);
router.delete("/delete", ImageController.deleteImage);
router.patch(
  "/update",
  upload.single("file"),
  validateMaliciousFile,
  ImageController.updateImage,
);

export const ImageRoutes = router;
