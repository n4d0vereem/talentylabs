import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Pendant le build, Next.js évalue les routes API
// On utilise une URL placeholder pour éviter les erreurs
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

// Connection avec pool configuré
const client = postgres(DATABASE_URL, {
  max: 10, // Maximum 10 connexions
  idle_timeout: 20, // Fermer après 20s d'inactivité
  connect_timeout: 10, // Timeout de connexion de 10s
});

// Database instance
export const db = drizzle(client, { schema });

// Export schema for use in API routes
export { schema };



