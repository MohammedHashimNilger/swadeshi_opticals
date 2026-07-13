import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas using the connection string in .env.
 * In serverless environments, we check mongoose's internal connection
 * state since module-level variables don't persist between invocations.
 */
export async function connectDB() {
  // Check if mongoose is already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in environment variables");
    return null;
  }

  try {
    // Create connection promise with timeout
    const connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      maxPoolSize: 10,
    });

    // Add a 10-second timeout to prevent Vercel function timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("MongoDB connection timeout")), 10000)
    );

    const connection = await Promise.race([connectionPromise, timeoutPromise]);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    return null;
  }
}

/**
 * Check if database connection is available
 */
export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}
