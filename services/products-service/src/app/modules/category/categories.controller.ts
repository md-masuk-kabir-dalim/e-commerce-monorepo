import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CategoryService } from "./categories.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await CategoryService.create(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await CategoryService.update(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.delete(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await CategoryService.getAll(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

const getHomePageData = catchAsync(async (req: Request, res: Response) => {
  const data = await CategoryService.getHomeData();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Home page retrieved successfully",
    data: data,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const category = await CategoryService.getById(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category retrieved successfully",
    data: category,
  });
});

export const CategoryController = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  getHomePageData,
};
