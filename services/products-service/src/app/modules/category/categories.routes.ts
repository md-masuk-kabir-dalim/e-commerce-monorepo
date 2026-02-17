import express from "express";
import { createCategorySchema } from "./categories.validation";
import { CategoryController } from "./categories.controller";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router.post(
  "/",

  validateRequest(createCategorySchema),
  CategoryController.createCategory,
);
router.get("/home-data", CategoryController.getHomePageData);
router.patch("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);
router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);

export const CategoryRoutes = router;
