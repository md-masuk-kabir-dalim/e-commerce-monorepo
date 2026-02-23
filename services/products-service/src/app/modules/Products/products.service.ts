import { Types } from "mongoose";
import { CreateProductInput } from "./products.validation";
import { searchPaginate } from "../../../helpers/searchAndPaginate";
import { generateUniqueIdentifier } from "../../../helpers/generateUniqueIdentifier";
import { getAuthConnection } from "services/products-service/src/config/database";
import { getProductsModel } from "./product.model";
import ApiError from "services/products-service/src/errors/ApiErrors";

/* =============================
   Private helper
============================= */
const getProductsRepository = () => {
  const connection = getAuthConnection();
  return getProductsModel(connection);
};

const createProduct = async (data: CreateProductInput) => {
  const Product = await getProductsRepository();
  const slug = await generateUniqueIdentifier(Product, data.name, "slug");

  const product = new Product({
    ...data,
    price: Number(data.price),
    originalPrice: Number(data.originalPrice),
    metaKeywords: data.metaKeywords?.split(",") || [],
    specifications: data.specifications,
    slug,
  });

  await product.save();
  return product;
};

const getAllProducts = async (query: any) => {
  const Product = await getProductsRepository();
  const filters: Record<string, any> = {};
  if (query.categoryId) {
    filters.categoryId = query.categoryId;
  }

  if (query.minRating) {
    filters.rating = { gte: Number(query.minRating) }; // products with rating >= minRating
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.gte = Number(query.minPrice);
    if (query.maxPrice) filters.price.lte = Number(query.maxPrice);
  }

  if (query.inStock !== undefined) {
    filters.inStock = query.inStock === "true";
  }

  return searchPaginate({
    model: Product,
    searchFields: ["name", "slug"],
    search: query.searchQuery || "",
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 10,
    filters,
    sortBy: query.sortBy || "createdAt",
    sortOrder: query.sortOrder || "desc",
    select:
      "id name slug price inStock stock originalPrice rating categoryId images",
    // populate: [
    //   { path: "categoryId", select: "name slug" },
    //   { path: "images", select: "url altText description" },
    // ],
  });
};

const getSingleProduct = async (value: string) => {
  const Product = await getProductsRepository();
  const isObjectId = Types.ObjectId.isValid(value);

  const query = isObjectId ? { _id: value } : { slug: value };

  return Product.findOne(query).populate("categoryId").exec();
};

const updateProduct = async (id: string, data: any) => {
  const Product = await getProductsRepository();
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid product ID");

  const updateData: any = {
    ...data,
    price: data.price ? Number(data.price) : undefined,
    originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
    metaKeywords: data.metaKeywords ? data.metaKeywords.split(",") : undefined,
    specifications: data.specifications || undefined,
  };

  return Product.findByIdAndUpdate(id, updateData, { new: true }).exec();
};

const deleteProduct = async (id: string) => {
  const Product = await getProductsRepository();
  if (!Types.ObjectId.isValid(id))
    throw new ApiError(404, "Invalid product ID");

  const existing = await Product.findById(id).exec();
  if (!existing) throw new Error("Product not found");

  // Delete images from cloud
  const publicIds = existing.images.map((img: { altText: any }) => img.altText);
  for (const publicId of publicIds) {
    // kafka event use
  }

  await existing.deleteOne();
  return;
};

const getSitemapData = async () => {
  const Product = await getProductsRepository();
  const productSlugs = await Product.find({}).select(
    "slug updatedAt createdAt",
  );
  return productSlugs;
};

export const ProductsService = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getSitemapData,
};
