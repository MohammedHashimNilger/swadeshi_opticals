import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas using the connection string in .env.
 * We cache the connection promise so repeated calls (which happen
 * naturally in a serverless environment, where this file may be
 * re-invoked on every request) don't open a new connection each time.
 */
let cachedConnection = null;
let connectionAttempted = false;

export async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  // Prevent multiple simultaneous connection attempts
  if (connectionAttempted) {
    return cachedConnection;
  }

  connectionAttempted = true;

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in environment variables");
    return null;
  }

  try {
    // Create connection promise with timeout
    const connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000, // 8 second timeout
      connectTimeoutMS: 8000,
    });

    // Add a 10-second timeout to prevent Vercel function timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("MongoDB connection timeout")), 10000)
    );

    cachedConnection = await Promise.race([connectionPromise, timeoutPromise]);
    console.log(`MongoDB connected: ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (err) {
    cachedConnection = null;
    console.error("MongoDB connection error:", err.message);
    // Don't throw - allow serverless function to continue
    // Routes will need to check if DB is available
    return null;
  }
}

/**
 * Check if database connection is available
 */
export function isDBConnected() {
  return cachedConnection !== null && cachedConnection.connection.readyState === 1;
}
