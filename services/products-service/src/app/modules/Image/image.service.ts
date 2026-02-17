import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { Readable } from "stream";
import sharp from "sharp";
import config from "../../../config";

dotenv.config();

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

/**
 * Convert image buffer to WebP with optional width resizing
 */
const convertToWebP = async (buffer: Buffer, width = 1024) => {
  return sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
};

/**
 * Upload image buffer to Cloudinary
 */
const uploadToCloudinary = async (buffer: Buffer, folder: string) => {
  const webpBuffer = await convertToWebP(buffer);
  return new Promise<any>((resolve, reject) => {
    const readable = new Readable();
    readable._read = () => {};
    readable.push(webpBuffer);
    readable.push(null);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `upload/${folder}`,
        resource_type: "image",
        format: "webp", // ensure Cloudinary stores as WebP
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    readable.pipe(stream);
    stream.on("error", (err) => reject(err));
  });
};

/**
 * Delete from Cloudinary
 */
const deleteFromCloudinary = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export const imageService = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
