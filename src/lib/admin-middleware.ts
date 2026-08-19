import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const requireAdminRole = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      uid: context.userId,
      check_role: "admin",
    });
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Forbidden: admin role required");
    return next();
  });
