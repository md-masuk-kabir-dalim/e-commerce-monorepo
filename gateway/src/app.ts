import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import hpp from "hpp";
import * as Sentry from "@sentry/node";
import { config } from "./config/env";
import logger from "./middlewares/logger.middleware";
import GlobalErrorHandler from "./middlewares/global.error.handler";

// =======================
// Sentry Setup (Error Monitoring)
// =======================
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.05,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    try {
      if (event.request) {
        if (event.request.headers) {
          if (event.request.headers.authorization) {
            event.request.headers.authorization = "[REDACTED]";
          }
        }
        event.request.data = "[REDACTED]";
      }
    } catch (err) {}
    return event;
  },
});

// =======================
// Express App Setup
// =======================
const app: Application = express();

// =======================
// CORS Setup
// =======================
const allowedOrigins = config.cors_origin;

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  credentials: true,
};

app.set("trust proxy", 1);

// =======================
// Middleware
// =======================
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(hpp());
app.use(express.json({ limit: "10mb" }));
// app.use(xssSanitizerMiddleware);
app.use(express.static("public"));

app.get("/api/v1/csrf-token", (req: Request, res: Response) => {
  res.set("Cache-Control", "no-store");
  res.send({ success: true, csrfToken: res.locals.csrfToken });
});

// =======================
// Request Logging Middleware
// =======================
app.use((req: Request, res: Response, next: NextFunction) => {
  // Mask Authorization header
  const headers = { ...req.headers };
  if (headers.authorization) headers.authorization = "";

  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
    headers,
  });

  next();
});

// =======================
// Slow Request Monitoring
// =======================
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.originalUrl}`, {
        duration,
      });
    }
  });
  next();
});

// =======================
// Routes
// =======================
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Welcome to the API" });
});

// =======================
// Global Error Handler
// =======================
app.use(GlobalErrorHandler);

// =======================
// 404 Handler
// =======================
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
