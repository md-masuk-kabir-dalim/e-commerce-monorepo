import { MongoClient } from "mongodb";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const ROOT_USER = process.env.MONGO_ROOT_USER || "root";
const ROOT_PASS = process.env.MONGO_ROOT_PASSWORD || "rootPassword123";

const DB_LIST = [
  "auth_db",
  "product_db",
  "order_db",
  "cart_db",
  "inventory_db",
  "payment_db",
];

async function createMongoUser() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const adminDb = client.db("admin");
    const usersInfo = await adminDb.command({ usersInfo: ROOT_USER });
    if (usersInfo.users && usersInfo.users.length > 0) {
      console.log(`User "${ROOT_USER}" already exists. Skipping creation.`);
      return;
    }

    await adminDb.command({
      createUser: ROOT_USER,
      pwd: ROOT_PASS,
      roles: DB_LIST.map((db) => ({ role: "readWrite", db })),
    });

    console.log("Root user created successfully for all microservice DBs!");
  } catch (err) {
    console.error("Error creating MongoDB user:", err);
  } finally {
    await client.close();
  }
}

// Run the script
createMongoUser();
