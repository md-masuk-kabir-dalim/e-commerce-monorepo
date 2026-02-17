import { Document, Types } from "mongoose";
import { Image } from "../../../interfaces/common";

export interface IProduct extends Document {
  name: string;
  price: number;
  originalPrice?: number;
  categoryId: Types.ObjectId;
  rating?: number;
  reviews?: number;
  stock?: number;
  images: Image[];
  description: string;
  specifications: any;
  inStock?: boolean;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}
