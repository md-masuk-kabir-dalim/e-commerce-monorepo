import express from "express";
import { ProductsController } from "./products.controller";
import { createProductSchema } from "./products.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.post(
  "/",
  validateRequest(createProductSchema),
  ProductsController.createProduct,
);

router.get("/sitemap", ProductsController.getSitemapData);
router.get("/", ProductsController.getAllProducts);

router.get("/:id", ProductsController.getSingleProduct);

router.patch("/:id", ProductsController.updateProduct);

router.delete("/:id", ProductsController.deleteProduct);

export const ProductsRoutes = router;
