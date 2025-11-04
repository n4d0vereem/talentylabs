import { betterAuth } from "better-auth";
import { db } from "./db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  secret: process.env.BETTER_AUTH_SECRET || "",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export type Auth = typeof auth;

