import { Connection, Schema } from "mongoose";

export const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    altText: { type: String, required: true },
    description: { type: String },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

export function getImagesModel(connection: Connection) {
  return connection.models.User || connection.model("User", ImageSchema);
}
