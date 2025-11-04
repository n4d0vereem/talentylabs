import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Allow build without DATABASE_URL (will fail at runtime if accessed)
const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/temp";

// Create postgres connection
const client = postgres(connectionString, {
  // Prevent connection during build
  max: process.env.NODE_ENV === "production" ? 10 : 1,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

