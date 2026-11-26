// Barrel: re-export Better Auth's generated tables (auth-schema.ts, owned by
// `npx auth generate` — never hand-edit) together with our own app tables
// (app-schema.ts). drizzle.config.ts and src/lib/db.ts import from here.
export * from "./auth-schema.js";
export * from "./app-schema.js";
