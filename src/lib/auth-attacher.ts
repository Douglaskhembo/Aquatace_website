import { createMiddleware } from "@tanstack/react-start";
import { getStoredToken } from "./auth-client";

// Registered as a global `functionMiddleware` in `src/start.ts`; attaches the
// admin JWT (if present) to every server function call so `requireAdminRole`
// can verify it.
export const attachAdminAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token = getStoredToken();
  return next({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
});
