import { Schema, model } from "mongoose";
import { ICategory } from "./category.interface";
import { ImageSchema } from "../Image/image.model";


const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: ImageSchema, required: true },
  },
  { timestamps: true }
);

CategorySchema.index({ name: 1 });

export const Category = model<ICategory>("Category", CategorySchema);
