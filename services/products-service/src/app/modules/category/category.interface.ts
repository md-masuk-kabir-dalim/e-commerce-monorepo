import { Document } from "mongoose";
import { Image } from "../../../interfaces/common";

export interface ICategory extends Document {
  name: string;
  slug: string;
  image: Image;
  createdAt: Date;
  updatedAt: Date;
}
