import mongoose from "mongoose";
import os from "node:os";
import path from "node:path";

let memory = null;

// Connects to MONGODB_URI, or starts a throwaway in-memory MongoDB when it isn't set
// (handy for development and tests: no database to install).
export async function connect(uri = process.env.MONGODB_URI) {
  if (!uri) {
    // Keep the mongod binary in a short, shared path (Windows refuses to start it from a deep node_modules folder)
    process.env.MONGOMS_DOWNLOAD_DIR ||= path.join(os.homedir(), ".cache", "mongodb-binaries");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memory = await MongoMemoryServer.create();
    uri = memory.getUri("cirta-academy");
    console.log("No MONGODB_URI set: using an in-memory MongoDB (data resets on restart)");
  }
  await mongoose.connect(uri);
  return { inMemory: Boolean(memory) };
}

export async function disconnect() {
  await mongoose.disconnect();
  if (memory) { await memory.stop(); memory = null; }
}
