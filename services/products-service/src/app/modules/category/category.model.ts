import { Connection, Schema, model } from "mongoose";
import { ICategory } from "./category.interface";
import { ImageSchema } from "services/products-service/src/shared/Image.schema";

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: ImageSchema, required: true },
  },
  { timestamps: true },
);

CategorySchema.index({ name: 1 });

export function getCategoryModel(connection: Connection) {
  return (
    connection.models.Categories ||
    connection.model<ICategory>("Categories", CategorySchema)
  );
}
