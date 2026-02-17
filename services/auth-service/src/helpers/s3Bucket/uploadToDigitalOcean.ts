import { ObjectCannedACL, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { tmpdir } from "os";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import config from "../../config";
import ApiError from "../../errors/ApiErrors";

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath.path);

const s3Config: S3ClientConfig = {
  endpoint: config.aws.space_endpoint,
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId as string,
    secretAccessKey: config.aws.secretAccessKey as string,
  },
  forcePathStyle: true,
};

export const s3 = new S3Client(s3Config);
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB for images
const MAX_VIDEO_SIZE = 1 * 1024 * 1024 * 1024; // 1 GB for videos

/**
 * Converts video buffer to webm format.
 */
const convertVideoToWebM = async (buffer: Buffer): Promise<Buffer> => {
  const inputPath = path.join(tmpdir(), `input-${Date.now()}.mp4`);
  const outputPath = path.join(tmpdir(), `output-${Date.now()}.webm`);

  await fs.writeFile(inputPath, buffer);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-c:v libvpx-vp9",
        "-deadline realtime",
        "-cpu-used 4",
        "-b:v 3M",
        "-crf 30",
        "-pix_fmt yuv420p",
        "-c:a libopus",
        "-b:a 96k",
      ])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  const outputBuffer = await fs.readFile(outputPath);

  await fs.unlink(inputPath);
  await fs.unlink(outputPath);

  return outputBuffer;
};

/**
 * Uploads a file buffer to DigitalOcean Spaces and returns the file URL.
 * Converts images to webp and videos to webm.
 */
const uploadToDigitalOcean = async (
  file: Express.Multer.File,
  folderName: string
): Promise<{ Location: string; Key: string }> => {
  try {
    if (!file) throw new ApiError(400, "No file provided");

    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    // Check file size
    if (
      (isImage && file.size > MAX_IMAGE_SIZE) ||
      (isVideo && file.size > MAX_VIDEO_SIZE)
    ) {
      throw new ApiError(
        400,
        `File size exceeds max limit: ${
          isImage ? MAX_IMAGE_SIZE / 1024 / 1024 : MAX_VIDEO_SIZE / 1024 / 1024
        } MB`
      );
    }

    let fileBuffer: Buffer;

    fileBuffer = await fs.readFile(file.path);
    let fileExtension = path.extname(file.originalname).toLowerCase();
    let mimeType = file.mimetype;

    if (isImage) {
      fileBuffer = await sharp(fileBuffer).webp().toBuffer();
      fileExtension = ".webp";
      mimeType = "image/webp";
    } else if (isVideo) {
      fileBuffer = await convertVideoToWebM(fileBuffer);
      fileExtension = ".webm";
      mimeType = "video/webm";
    }

    const fileName = `deshi-desgin/${folderName}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}${fileExtension}`;

    const uploadParams = {
      Bucket: config.aws.bucketName,
      Key: fileName,
      Body: fileBuffer,
      ACL: "public-read" as ObjectCannedACL,
      ContentType: mimeType,
    };

    const upload = new Upload({
      client: s3,
      params: uploadParams,
    });

    const data = await upload.done();

    return {
      Location: data?.Location as string,
      Key: data?.Key as string,
    };
  } catch (error) {
    throw new ApiError(
      500,
      error instanceof Error
        ? `Failed to upload file: ${error.message}`
        : "Failed to upload file to DigitalOcean Spaces"
    );
  } finally {
    if (fsSync.existsSync(file.path)) {
      await fs.unlink(file.path);
    }
  }
};

export default uploadToDigitalOcean;
