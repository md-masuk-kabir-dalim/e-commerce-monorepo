import mongoose from "mongoose";
import { connectAndWait, createMongoConnection } from "shared/db/mongo";
import ApiError from "../errors/ApiErrors";

const PRODUCTS_URI = `mongodb+srv://bdUser:uTpkFGBuxo2hTmbF@cluster0.s0tuw8w.mongodb.net/images_db?retryWrites=true&w=majority&appName=Cluster0`;

let authConnection: mongoose.Connection | null = null;

export async function initAuthServiceDb() {
  if (!authConnection) {
    authConnection = createMongoConnection("images_db", PRODUCTS_URI);
  }

  await connectAndWait(authConnection, "images_db");
  return authConnection;
}

export function getAuthConnection() {
  if (!authConnection) {
    throw new ApiError(500, "Images DB not initialized yet");
  }
  return authConnection;
}
