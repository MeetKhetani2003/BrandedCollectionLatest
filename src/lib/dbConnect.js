import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDb() {
  const uri = "mongodb+srv://brandedcollectionrajkot2020_db_user:3BvilvpudgOXXClM@cluster0.hfqifsb.mongodb.net/Prod-Hostinger?appName=Cluster0"

  if (!uri) {
    throw new Error("❌ MONGODB_URI is missing");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
