import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { config } from "../config/env";
import ApiError from "../errors/api.errors";
import { logger } from "../utils/logger";

interface IGenericErrorMessage {
  path: string;
  message: string;
}

const GlobalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message: string = error.message || "An unexpected error occurred.";
  let errorMessages: IGenericErrorMessage[] = [];

  const createErrorMessage = (
    path: string,
    msg: string,
  ): IGenericErrorMessage => ({
    path,
    message: msg,
  });

  // ---------------------- Security logging ----------------------
  const logSecurity = (reason: string) => {
    logger.error(reason, {
      path: req.originalUrl,
      ip: req.ip,
      method: req.method,
      body: "[SANITIZED]",
      headers: "[SANITIZED]",
    });
  };

  // ---------------------- Handle different error types ----------------------
  if (error.code === "EBADCSRFTOKEN") {
    statusCode = 403;
    message = "Invalid CSRF token";
    errorMessages.push(createErrorMessage(req.originalUrl, message));
    logSecurity("Invalid CSRF token detected");
  }

  // Mongoose Validation Error
  else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation failed";
    for (const field in error.errors) {
      errorMessages.push(
        createErrorMessage(field, error.errors[field].message),
      );
    }
  }

  // Mongoose Duplicate Key Error
  else if (error.code && error.code === 11000) {
    statusCode = httpStatus.CONFLICT;
    const field = Object.keys(error.keyValue)[0];
    message = `Duplicate value for '${field}' field. It must be unique.`;
    errorMessages.push(createErrorMessage(field, message));
  }

  // Mongoose Cast Error (invalid ObjectId)
  else if (error instanceof mongoose.Error.CastError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = `Invalid value for '${error.path}'`;
    errorMessages.push(createErrorMessage(error.path, message));
  }

  // Zod validation
  else if (error instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation error";

    // Use error.issues instead of error.errors
    error.issues.forEach((issue) => {
      errorMessages.push(
        createErrorMessage(issue.path.join("."), issue.message),
      );
    });
  }

  // Custom API Error
  else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessages = error.errors
      ? Array.isArray(error.errors)
        ? error.errors
        : [{ path: "", message: error.errors }]
      : [{ path: "", message }];
    if (statusCode === 401 || statusCode === 403) {
      logSecurity(`Unauthorized or forbidden request: ${message}`);
    }
  }
  // JWT errors
  else if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError"
  ) {
    statusCode = 401;
    message = "Invalid or expired token.";
    errorMessages.push(createErrorMessage("", message));
    logSecurity(`JWT error: ${error.message}`);
  }

  // Generic Error fallback
  else if (error instanceof Error) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = error.message || "Unexpected error occurred.";
    errorMessages.push(createErrorMessage("", message));
  }

  // ---------------------- Sanitize logs ----------------------
  const sanitizedBody = { ...req.body };
  logger.warn({
    message: error.message,
    path: req.originalUrl,
    body: sanitizedBody,
    headers: "[SANITIZED]",
  });

  // ---------------------- Response ----------------------
  const responseBody: any = {
    success: false,
    message,
    data: null,
    errors: errorMessages,
    meta: { apiVersion: "v1" },
  };

  if (config.env !== "production") {
    responseBody.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  res.status(statusCode).json(responseBody);
};

export default GlobalErrorHandler;
