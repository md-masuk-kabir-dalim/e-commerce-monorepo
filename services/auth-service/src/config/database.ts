import mongoose from "mongoose";

export async function initAuthServiceDb() {
  try {
    const MONGO_URI = `mongodb+srv://bdUser:uTpkFGBuxo2hTmbF@cluster0.s0tuw8w.mongodb.net/auth_db?retryWrites=true&w=majority&appName=Cluster0`;

    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ Mongoose connected successfully to "auth_db"`);

    mongoose.connection.on("connected", () =>
      console.log("🟢 Mongoose connection open"),
    );
    mongoose.connection.on("error", (err) =>
      console.error("🔴 Mongoose connection error:", err),
    );
    mongoose.connection.on("disconnected", () =>
      console.warn("⚪ Mongoose disconnected"),
    );
  } catch (err) {
    console.error(`❌ Mongoose connection error for "auth_db":`, err);
    throw err;
  }
}
