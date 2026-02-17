import { Request, Response, NextFunction } from "express";
import ApiError from "../../errors/ApiErrors";

const allowedSignatures: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF for WEBP
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

const detectMimeType = (buffer: Buffer): string | null => {
  for (const [mime, signatures] of Object.entries(allowedSignatures)) {
    for (const sig of signatures) {
      const slice = buffer.slice(0, sig.length);
      if (sig.every((byte, i) => slice[i] === byte)) {
        return mime;
      }
    }
  }
  return null;
};

export const validateMaliciousFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    if (!file) return next();

    const buffer = file.buffer;
    if (!buffer || buffer.length === 0) {
      return next(new ApiError(400, "Invalid or empty file uploaded."));
    }

    // Detect real MIME type
    const realType = detectMimeType(buffer);
    if (!realType)
      return next(new ApiError(400, "Unable to detect file type."));

    const allowedTypes = Object.keys(allowedSignatures);
    if (!allowedTypes.includes(realType)) {
      return next(new ApiError(400, `File type not allowed: ${realType}`));
    }

    // Malicious Pattern Scan
    const contentStr = buffer.toString("utf8").toLowerCase();
    const blackList = ["<script", "<?php", "<iframe", "<object", "<embed"];
    for (const pattern of blackList) {
      if (contentStr.includes(pattern)) {
        return next(new ApiError(400, "Malicious content detected in file!"));
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};
