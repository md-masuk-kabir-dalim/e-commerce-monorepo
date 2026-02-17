import fs from "fs";
import path from "path";
import { Request } from "express";
import { FileFilterCallback } from "multer";
import scanFile from "./scanFile";

// Allowed file extensions + magic numbers
const allowedFileTypes: Record<string, Buffer[]> = {
  jpg: [Buffer.from([0xff, 0xd8, 0xff])],
  jpeg: [Buffer.from([0xff, 0xd8, 0xff])],
  png: [Buffer.from([0x89, 0x50, 0x4e, 0x47])],
  gif: [Buffer.from([0x47, 0x49, 0x46, 0x38])],
  pdf: [Buffer.from([0x25, 0x50, 0x44, 0x46])],
  mp4: [Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70])],
  mov: [Buffer.from([0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70])],
  avi: [Buffer.from([0x52, 0x49, 0x46, 0x46])],
  mkv: [Buffer.from([0x1a, 0x45, 0xdf, 0xa3])],
};

const fileFilterHelper = async (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

  if (!allowedFileTypes[ext]) {
    return callback(new Error("❌ Invalid file type!"));
  }

console.log(file);

  // Stream first 64 bytes for magic number check, force Buffer output
  const readStream = fs.createReadStream(file.path, { start: 0, end: 64 });
  const chunks: Buffer[] = [];

  readStream.on("data", (chunk) => {
    // TypeScript now knows chunk is Buffer
    chunks.push(chunk as Buffer);
  });

  readStream.on("end", async () => {
    const buffer = Buffer.concat(chunks);

    // Validate magic number
    const validHeader = allowedFileTypes[ext].some((magic) =>
      buffer.slice(0, magic.length).equals(magic)
    );
    if (!validHeader) return callback(new Error("❌ File signature mismatch!"));

    // Quick malicious pattern scan
    const contentStr = buffer.toString("utf8").toLowerCase();
    if (contentStr.includes("<script>") || contentStr.includes("<?php")) {
      return callback(new Error("❌ Malicious content detected!"));
    }

    try {
      await scanFile(file.path); // ClamAV scan
      callback(null, true);
    } catch (err: any) {
      callback(err);
    }
  });

  readStream.on("error", (err) => callback(err));
};

export default fileFilterHelper;
