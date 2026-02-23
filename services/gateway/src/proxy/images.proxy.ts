import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { config } from "../config/env";

export const imagesProxy = createProxyMiddleware({
  target: config.IMAGES_SERVICE,
  changeOrigin: true,
  selfHandleResponse: false,
  pathRewrite: { "^/api/v1/image": "" },

  on: {
    proxyReq: fixRequestBody,
  },
});
