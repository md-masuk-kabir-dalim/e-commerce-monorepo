import { Document, Model, Query } from "mongoose";

export interface PopulateOption {
  path: string;
  select?: string;
}

export interface Filters {
  [key: string]: any;
}

interface SearchPaginateOptions<T extends Document> {
  model: Model<T>;
  searchFields?: (keyof T)[];
  query?: Record<string, any>;
  filters?: Filters;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  select?: string;
  populate?: PopulateOption | PopulateOption[];
}

export const searchPaginate = async <T extends Document>({
  model,
  searchFields = [],
  query = {},
  filters = {},
  search = "",
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  select,
  populate,
}: SearchPaginateOptions<T>) => {
  const filter: any = { ...query };

  //------------------------------------------
  // Search Filter
  //------------------------------------------
  if (search && searchFields.length > 0) {
    filter["$or"] = searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  //------------------------------------------
  // Apply Additional Filters
  //------------------------------------------
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    // Range filters
    if (typeof value === "object" && !Array.isArray(value)) {
      const rangeObj: any = {};
      if (value.gte) rangeObj.$gte = value.gte;
      if (value.lte) rangeObj.$lte = value.lte;
      if (value.gt) rangeObj.$gt = value.gt;
      if (value.lt) rangeObj.$lt = value.lt;
      if (Object.keys(rangeObj).length > 0) {
        filter[key] = rangeObj;
        return;
      }
    }

    // Array (IN)
    if (Array.isArray(value)) {
      filter[key] = { $in: value };
      return;
    }

    // Normal equality filter
    filter[key] = value;
  });

  //------------------------------------------
  // Pagination
  //------------------------------------------
  const skip = (page - 1) * limit;
  const total = await model.countDocuments(filter);

  let queryBuilder: Query<any[], T> = model
    .find(filter)
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  //------------------------------------------
  // SELECT
  //------------------------------------------
  if (select) queryBuilder = queryBuilder.select(select);

  //------------------------------------------
  // POPULATE
  //------------------------------------------
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((pop) => (queryBuilder = queryBuilder.populate(pop)));
    } else {
      queryBuilder = queryBuilder.populate(populate);
    }
  }

  const data = await queryBuilder.exec();

  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    data,
  };
};
