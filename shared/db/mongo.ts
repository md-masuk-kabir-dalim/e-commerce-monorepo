import mongoose from "mongoose";

export function createMongoConnection(dbName: string, uri: string) {
  const connection = mongoose.createConnection(uri, {
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });

  connection.on("connected", () => console.log(`🟢 Connected to ${dbName}`));
  connection.on("error", (err) => console.error(`🔴 Error ${dbName}:`, err));
  connection.on("disconnected", () =>
    console.warn(`⚪ Disconnected ${dbName}`),
  );

  return connection;
}

export async function connectAndWait(
  connection: mongoose.Connection,
  dbName: string,
) {
  if (connection.readyState === 1) return;
  await connection.asPromise();
  console.log(`✅ ${dbName} ready`);
}
