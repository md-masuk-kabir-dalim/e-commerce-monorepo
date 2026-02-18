import mongoose, { Connection } from "mongoose";

const MONGO_URI =
  process.env.DATABASE_URL!.trim() ??
  "mongodb+srv://bdUser:uTpkFGBuxo2hTmbF@cluster0.s0tuw8w.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0";

const connections: Record<string, Connection> = {};

export const getMongooseConnection = async (
  dbName: string,
): Promise<Connection> => {
  if (connections[dbName]) {
    return connections[dbName];
  }

  try {
    const conn = await mongoose
      .createConnection(MONGO_URI, {
        dbName,
        autoIndex: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      })
      .asPromise();

    console.log(`✅ Mongoose connected successfully to "${dbName}"`);
    connections[dbName] = conn;
    return conn;
  } catch (err) {
    console.error(`❌ Mongoose connection error for "${dbName}":`, err);
    throw err;
  }
};
