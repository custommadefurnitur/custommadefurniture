// src/lib/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error('Critical Error: Please define the MONGODB_URI configuration within .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

// Intercept global context declarations safely for TypeScript compilation
const cached = global.mongoose ??= { conn: null, promise: null };

export async function connectDB() {
  // If a connection loop is already established, return it immediately
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log("🚀 MongoDB Mongoose pipeline fully authorized and connected.");
      return m;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}
