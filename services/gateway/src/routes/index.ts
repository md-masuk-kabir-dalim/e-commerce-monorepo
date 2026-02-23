import { Router } from "express";
import { authProxy } from "../proxy/auth.proxy";
import { imagesProxy } from "../proxy/images.proxy";
import { productsProxy } from "../proxy/product.proxy";

const router = Router();

router.get("/health", (req, res) => {
  res.send({ status: "ok" });
});

router.use("/auth-service", authProxy);
router.use("/images-service", imagesProxy);
router.use("/products-service", productsProxy);

export default router;
