import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { verifyAdminToken } from "./auth.server";

export const requireAdminRole = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  const authHeader = request?.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: No authorization header provided");
  }

  const token = authHeader.slice("Bearer ".length);
  const claims = await verifyAdminToken(token);
  if (!claims) {
    throw new Error("Unauthorized: Invalid or expired token");
  }

  return next({ context: { userId: claims.sub, email: claims.email } });
});
