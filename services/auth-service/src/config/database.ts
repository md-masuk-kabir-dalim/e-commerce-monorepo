import { getMongooseConnection } from "infra/mongo/mongo.client";

export async function initAuthServiceDb() {
  await getMongooseConnection("auth_db");
  console.log("Auth DB initialized successfully!");
}
