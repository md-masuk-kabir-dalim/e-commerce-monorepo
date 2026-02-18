import { createProxyMiddleware } from "http-proxy-middleware";
import { config } from "../config/env";

export const authProxy = createProxyMiddleware({
  target: config.AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: { "^/auth": "" },
});
