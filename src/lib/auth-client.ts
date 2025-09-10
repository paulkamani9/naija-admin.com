import { createAuthClient } from "better-auth/client";

export const { signIn, signUp, signOut, useSession, } = createAuthClient({
  baseURL: process.env.BASE_URL! || "http://localhost:3000",
});
