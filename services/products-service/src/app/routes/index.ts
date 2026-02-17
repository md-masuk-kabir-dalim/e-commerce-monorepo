import express from "express";
import { ImageRoutes } from "../modules/Image/image.routes";
import { ProductsRoutes } from "../modules/Products/products.route";
import { CategoryRoutes } from "../modules/category/categories.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/image",
    route: ImageRoutes,
  },
  {
    path: "/product",
    route: ProductsRoutes,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
