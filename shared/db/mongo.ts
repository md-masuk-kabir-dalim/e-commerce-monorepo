import mongoose from "mongoose";

export function createMongoConnection(dbName: string, uri: string) {
  const connection = mongoose.createConnection(uri, {
    autoIndex: false,
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    w: "majority",
    bufferCommands: false,
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
