import express from "express";
import { ImageRoutes } from "../modules/Image/image.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/image",
    route: ImageRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
