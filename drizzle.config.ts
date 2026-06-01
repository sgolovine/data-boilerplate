import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./schema/index.ts",
  out: "./data/migrations",
  dbCredentials: {
    url: "./data/research.sqlite",
  },
});
