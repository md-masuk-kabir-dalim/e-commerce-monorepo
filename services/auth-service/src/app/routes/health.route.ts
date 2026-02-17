import { Router, Request, Response } from "express";
import httpStatus from "http-status";

const healthRoute = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint
 * @access  Public
 */
healthRoute.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    apiVersion: "v1",
  });
});

export default healthRoute;
