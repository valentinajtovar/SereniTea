import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("❌ No se encontró la variable MONGODB_URI en .env.local");
}

export async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    // Ya está conectado
    return mongoose.connection;
  }

  // Conexión nueva
  await mongoose.connect(MONGODB_URI, { dbName: "serenitea" });
  console.log("✅ Conectado a MongoDB Atlas");
  return mongoose.connection;
}
