import { Schema, model } from "mongoose";
import { IProduct } from "./product.interface";
import { ImageSchema } from "../Image/image.model";

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    images: [ImageSchema],
    description: { type: String, required: true },
    specifications: { type: Schema.Types.Mixed, required: false },
    inStock: { type: Boolean, default: true },
    slug: { type: String, unique: true, required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
  },
  { timestamps: true }
);

ProductSchema.index({ createdAt: 1 });
ProductSchema.index({ updatedAt: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: "text", slug: "text" });
ProductSchema.index({ originalPrice: 1 });

export const Product = model<IProduct>("Product", ProductSchema);
