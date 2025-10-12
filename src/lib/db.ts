import mongoose from "mongoose";

const uri = process.env.MONGODB_URI!;
let cached = (global as any)._mongoose || { conn: null, promise: null };
(global as any)._mongoose = cached;

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
