import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDb() {
  // 1. Get the correct URI based on the environment
  const env = process.env.NODE_ENV || "development";
  const uriKey = env === "development" ? "MONGODB_DEV_URI" : "MONGODB_PROD_URI";
  const uri = process.env[uriKey];

  if (!uri) {
    throw new Error(`Missing MongoDB URI for environment: ${env}.`);
  }

  // 2. Return cached connection if already established
  if (cached.conn) {
    // console.log("Database connection reused."); // Optional: re-add log for verification
    return cached.conn;
  }

  // 3. If a connection promise is in progress, return it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Prevents Mongoose from buffering operations
    };

    // Store the connection promise
    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      // console.log(`Successfully connected to MongoDB (${env.toUpperCase()} DB).`); // Optional: re-add log for verification
      return mongoose;
    });
  }

  try {
    // 4. Wait for the connection promise to resolve
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Reset the promise if the connection fails, allowing a retry
    cached.promise = null;
    console.error("❌ MONGODB CONNECTION ERROR:", error.message);
    // Re-throw the error so the API route can handle the 500 response
    throw new Error("Failed to connect to the database.");
  }
}
