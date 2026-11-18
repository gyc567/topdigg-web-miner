/**
 * Browser client for Better Auth. Same-origin — the Vite dev server proxies
 * /api to the local API server, and Vercel serves /api/auth natively.
 */
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { useSession, signIn, signUp, signOut } = authClient;
