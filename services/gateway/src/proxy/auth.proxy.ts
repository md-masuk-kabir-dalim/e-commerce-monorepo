import { createProxyMiddleware } from "http-proxy-middleware";
import { Request, Response } from "express";
import { IncomingMessage } from "http";
import { config } from "../config/env";
type ProxyResponse = IncomingMessage & { statusCode?: number };

export const authProxy = createProxyMiddleware({
  target: config.AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    "^/api/v1/auth": "/api/v1/auth",
  },
  logLevel: "debug",

  onProxyReq(proxyReq: any, req: Request, res: Response) {
    console.log(
      "[Proxy] Request to Auth Service:",
      req.method,
      req.originalUrl,
    );
  },

  onProxyRes(proxyRes: ProxyResponse, req: Request, res: Response) {
    console.log(
      "[Proxy] Response from Auth Service:",
      proxyRes.statusCode,
      req.originalUrl,
    );
  },
} as any);
