import { Image } from "../../../interfaces/common";
import { getCategoryModel } from "./category.model";
import { ICategory } from "./category.interface";
import { searchPaginate } from "../../../helpers/searchPaginate";
import { generateUniqueIdentifier } from "../../../helpers/generateUniqueIdentifier";
import { getAuthConnection } from "services/products-service/src/config/database";
/* =============================
   Private helper
============================= */
const getCategoryRepository = () => {
  const connection = getAuthConnection();
  return getCategoryModel(connection);
};

export interface CreateCategoryInput {
  name: string;
  image: Image;
}

export const CategoryService = {
  // CREATE
  create: async (payload: CreateCategoryInput) => {
    const Category = await getCategoryRepository();
    const slug = await generateUniqueIdentifier(Category, payload.name, "slug");

    const category = new Category({
      name: payload.name,
      slug,
      image: payload.image,
    });

    await category.save();
    return category;
  },

  // UPDATE
  update: async (id: string, payload: Partial<ICategory>) => {
    const Category = await getCategoryRepository();
    const category = await Category.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return category;
  },

  // DELETE
  delete: async (id: string) => {
    const Category = await getCategoryRepository();
    const category = await Category.findById(id);

    if (!category) return null;

    await category.deleteOne();
    return { message: "Category deleted successfully" };
  },

  // GET ALL WITH SEARCH & PAGINATION
  getAll: async (query: {
    page?: number;
    limit?: number;
    searchQuery?: string;
  }) => {
    const Category = await getCategoryRepository();
    const { page = 1, limit = 10, searchQuery = "" } = query;

    return searchPaginate<ICategory>({
      model: Category,
      searchFields: ["name", "slug"],
      search: searchQuery,
      page,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  },

  // GET BY ID
  getById: async (id: string) => {
    const Category = await getCategoryRepository();
    return Category.findById(id);
  },

  // GET HOME PAGE DATA
  getHomeData: async () => {
    const Category = await getCategoryRepository();
    const sections = await Category.aggregate([
      { $sort: { priority: 1 } },
      { $limit: 5 }, // top 5 categories
      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$categoryId", "$$categoryId"] }],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 10 }, // top 10 products per category
            {
              $project: {
                _id: 1,
                name: 1,
                price: 1,
                originalPrice: 1,
                images: 1,
                inStock: 1,
                slug: 1,
                rating: 1,
              },
            },
          ],
          as: "products",
        },
      },
      {
        $project: {
          _id: "$_id",
          name: "$name",
          slug: "$slug",
          image: "$image",
          products: 1,
        },
      },
    ]);

    return sections;
  },
};
