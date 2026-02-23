import { Document, Model, Query } from "mongoose";

export interface PopulateOption {
  path: string;
  select?: string;
}

interface SearchPaginateOptions<T extends Document> {
  model: Model<T>;
  searchFields?: (keyof T)[];
  filters?: Record<string, any>;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  select?: string;
  populate?: PopulateOption | PopulateOption[];
  skipCount?: boolean;
}

export const searchPaginate = async <T extends Document>({
  model,
  searchFields = [],
  filters = {},
  search = "",
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  select,
  populate,
  skipCount = false,
}: SearchPaginateOptions<T>) => {
  const filter: any = {};

  if (search && searchFields.length > 0) {
    filter.$text = { $search: search };
  }

  // 🔹 APPLY FILTERS
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // Range filters
    if (typeof value === "object" && !Array.isArray(value)) {
      const range: any = {};
      if (value.gte !== undefined) range.$gte = value.gte;
      if (value.lte !== undefined) range.$lte = value.lte;
      if (Object.keys(range).length) filter[key] = range;
      return;
    }

    // IN query
    if (Array.isArray(value)) {
      filter[key] = { $in: value };
      return;
    }

    filter[key] = value;
  });

  const skip = (page - 1) * limit;

  let queryBuilder: Query<any[], T> = model
    .find(filter)
    .lean()
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  if (select) queryBuilder = queryBuilder.select(select);

  if (populate) {
    (Array.isArray(populate) ? populate : [populate]).forEach(
      (p) => (queryBuilder = queryBuilder.populate(p))
    );
  }

  // 🔹 Skip counting for small DB (very fast)
  const dataPromise = queryBuilder.exec();
  const totalPromise = skipCount
    ? Promise.resolve(dataPromise.then((d) => d.length))
    : model.countDocuments(filter);

  const [total, data] = await Promise.all([totalPromise, dataPromise]);

  return {
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    data,
  };
};
