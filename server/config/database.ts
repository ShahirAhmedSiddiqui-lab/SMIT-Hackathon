import mongoose from "mongoose";
import { User } from "../models/user";

export const connectDatabase = async (uri: string, dbName = "hcm-lite"): Promise<void> => {
  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
  // Remove the legacy global Admin index before creating the workspace-scoped one.
  await User.collection.dropIndex("one_initial_admin").catch(() => undefined);
  await User.createIndexes();
  console.log("MongoDB connected");
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
