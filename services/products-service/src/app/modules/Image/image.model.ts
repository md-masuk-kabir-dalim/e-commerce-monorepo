import { Schema } from "mongoose";

export const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    altText: { type: String, required: true },
    description: { type: String },
    publicId: { type: String, required: true },
  },
  { _id: false }
);
