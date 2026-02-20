import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { config } from "../config/env";

export const authProxy = createProxyMiddleware({
  target: config.AUTH_SERVICE,
  changeOrigin: true,
  selfHandleResponse: false,
  pathRewrite: { "^/api/v1/auth": "" },

  on: {
    proxyReq: fixRequestBody,
  },
});
