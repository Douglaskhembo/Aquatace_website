import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getDb } from "./db.server";
import { signAdminToken, verifyAdminToken, verifyPassword } from "./auth.server";

const LoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const login = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LoginSchema.parse(input))
  .handler(async ({ data }): Promise<{ token: string; email: string }> => {
    const db = getDb();
    const { rows } = await db.query<{ id: string; email: string; password_hash: string }>(
      "SELECT id, email, password_hash FROM admin_users WHERE email = $1",
      [data.email],
    );
    const user = rows[0];
    if (!user) throw new Error("Invalid email or password.");

    const valid = await verifyPassword(data.password, user.password_hash);
    if (!valid) throw new Error("Invalid email or password.");

    const token = await signAdminToken({ sub: user.id, email: user.email });
    return { token, email: user.email };
  });

export const getCurrentAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ email: string } | null> => {
    const request = getRequest();
    const authHeader = request?.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice("Bearer ".length);
    const claims = await verifyAdminToken(token);
    if (!claims) return null;
    return { email: claims.email };
  },
);
