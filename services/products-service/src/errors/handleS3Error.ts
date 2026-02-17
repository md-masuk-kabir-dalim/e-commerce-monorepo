// S3 error handler
export const handleS3Error = (error: any) => {
  const errorMap: Record<string, { status: number; message: string }> = {
    NoSuchKey: { status: 404, message: "Video file not found" },
    NoSuchBucket: { status: 404, message: "Storage bucket not found" },
    AccessDenied: { status: 403, message: "Access denied to video file" },
    InvalidRange: { status: 416, message: "Invalid range request" },
    InternalError: { status: 500, message: "Storage service error" },
    ServiceUnavailable: { status: 503, message: "Storage service unavailable" },
    RequestTimeout: { status: 408, message: "Request timeout" },
  };

  const errorInfo = errorMap[error.name] || {
    status: 500,
    message: "Unknown storage error",
  };

  return {
    ...errorInfo,
    originalError: error.name,
  };
};
