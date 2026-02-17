
import { GetObjectCommandOutput } from "@aws-sdk/client-s3";

export function getSafariOptimizedHeaders(
  s3Response: GetObjectCommandOutput,
  userAgent: string,
  range?: string
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (s3Response.ContentType) {
    headers["Content-Type"] = s3Response.ContentType;
  }

  if (s3Response.ContentLength && !range) {
    headers["Content-Length"] = s3Response.ContentLength.toString();
  }

  if (s3Response.ETag) {
    headers["ETag"] = s3Response.ETag.replace(/"/g, "");
  }

  if (s3Response.LastModified) {
    headers["Last-Modified"] = new Date(s3Response.LastModified).toUTCString();
  }

  if (s3Response.ContentRange) {
    headers["Content-Range"] = s3Response.ContentRange;
    headers["Accept-Ranges"] = "bytes";
  }

  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);

  if (isSafari || isIOS) {
    headers["Cache-Control"] = "no-cache";
    if (!headers["Accept-Ranges"]) {
      headers["Accept-Ranges"] = "bytes";
    }
  }

  return headers;
}