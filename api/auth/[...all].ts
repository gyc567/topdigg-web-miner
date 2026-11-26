/**
 * Better Auth API handler — mounts every auth endpoint plus the Dodo plugin
 * routes (/api/auth/dodopayments/*) under /api/auth.
 */
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../src/lib/auth";

export default toNodeHandler(auth.handler);
