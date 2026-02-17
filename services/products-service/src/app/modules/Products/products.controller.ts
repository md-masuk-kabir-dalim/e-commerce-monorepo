import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ProductsService } from "./products.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductsService.createProduct(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductsService.getAllProducts(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Products retrieved",
    data: result,
  });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductsService.getSingleProduct(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Single product retrieved",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductsService.updateProduct(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product updated",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await ProductsService.deleteProduct(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product deleted",
  });
});

const getSitemapData = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductsService.getSitemapData();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product sitemap data",
    data: result,
  });
});

export const ProductsController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getSitemapData,
};
