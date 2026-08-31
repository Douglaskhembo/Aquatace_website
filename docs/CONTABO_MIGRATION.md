# Migrating off Railway + Supabase → Contabo VPS (plain Postgres)

Final architecture:
- **No Supabase software at all** — no Auth/GoTrue, no PostgREST, no Storage API.
  The app talks directly to a plain Postgres database via `pg`, does its own
  JWT-based admin auth, and stores uploaded media on local disk.
- Postgres: your existing native **Postgres 17** install on the Contabo VPS.
- App: Docker container (see `Dockerfile`/`docker-compose.yml` at repo root),
  auto-deployed on every push to `main` via GitHub Actions
  (`.github/workflows/deploy.yml`).
- Domain: `aquatace.co.ke`.

This replaces the earlier plan (self-hosting Supabase's own Docker stack) — that
approach is no longer used.

---

## Part 1 — Database

### 1a. Create the app's database and role

On the VPS, as the `postgres` user:

```bash
sudo -u postgres psql
```

```sql
CREATE ROLE aquatace WITH LOGIN PASSWORD 'pick-a-strong-password';
CREATE DATABASE aquatace OWNER aquatace;
```

### 1b. Apply the schema

`db/schema.sql` (in this repo) is the full schema — no RLS, no Supabase-specific
objects, just the tables the app actually queries, plus a new `admin_users`
table that replaces Supabase Auth entirely.

```bash
psql "postgresql://aquatace:PASSWORD@localhost:5432/aquatace" -f db/schema.sql
```

### 1c. Load your existing data

`db/data_dump.sql` was generated directly from your live Supabase Cloud project
(via its REST API, using the service-role key already in `.env`) — it contains
your real `branches`, `products`, `gallery_images`, `orders`, and `order_items`
rows as plain `INSERT` statements against the schema above.

```bash
psql "postgresql://aquatace:PASSWORD@localhost:5432/aquatace" -f db/data_dump.sql
```

Counts at export time: 4 branches, 29 products, 0 gallery images, 2 orders, 5
order items. Re-run the export (see `scripts/` note below) if more data has
been added since.

### 1d. Create the admin login

Supabase Auth's password hash format isn't reused — the new system has its own
`admin_users` table (bcrypt-hashed passwords, checked in `src/lib/auth.server.ts`).
Set the DB connection once, then create the login:

```bash
export DATABASE_URL="postgresql://aquatace:PASSWORD@localhost:5432/aquatace"
node scripts/create-admin.mjs you@aquatace.co.ke 'a-strong-password'
```

Re-running this with the same email resets that admin's password.

---

## Part 2 — Deploy the app (Docker)

On the VPS:

```bash
sudo mkdir -p /opt/aquatace-streamline
sudo chown $USER:$USER /opt/aquatace-streamline
git clone git@github.com:Douglaskhembo/Aquatace_website.git /opt/aquatace-streamline
cd /opt/aquatace-streamline
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=postgresql://aquatace:PASSWORD@localhost:5432/aquatace
JWT_SECRET=<openssl rand -base64 48>
NODE_ENV=production
PORT=3000
UPLOADS_DIR=/app/uploads
```

Build and start:

```bash
docker compose up -d --build
```

`docker-compose.yml` runs the container with `network_mode: host`, so it can
reach Postgres on `localhost:5432` directly (no Docker network setup needed),
and listens on `localhost:3000`. Uploaded media (product/gallery photos) is
written to a named Docker volume (`uploads_data`) mounted at `/app/uploads`, so
it survives rebuilds/redeploys.

### Put it behind HTTPS

The app container only binds `localhost:3000` — put a reverse proxy in front
for TLS on `aquatace.co.ke`. Caddy is the simplest option (automatic Let's
Encrypt certs):

```bash
sudo apt install -y caddy
```

`/etc/caddy/Caddyfile`:

```
www.aquatace.co.ke {
	redir https://aquatace.co.ke{uri} permanent
}

aquatace.co.ke {
	reverse_proxy localhost:3000
}
```

The `www` block matters: without it, Caddy has no TLS certificate for
`www.aquatace.co.ke`, so a browser hitting that host over HTTPS gets a
connection error instead of the site — it looks like "the site doesn't load
unless you type the exact URL". The redirect block fixes that and keeps
`aquatace.co.ke` (no `www`) as the one canonical URL (matches `SITE_URL` in
`src/lib/seo/config.ts`).

```bash
sudo systemctl reload caddy
```

Point both `aquatace.co.ke` and `www.aquatace.co.ke` DNS records at the VPS's IP.

---

## Part 3 — Auto-deploy on push (GitHub Actions)

`.github/workflows/deploy.yml` runs on every push to `main`: SSHes into the
VPS, pulls the latest code, and runs `docker compose up -d --build`. No
container registry involved — the image builds on the VPS.

### One-time setup

1. Generate a dedicated deploy key (don't reuse your personal key):
   ```bash
   ssh-keygen -t ed25519 -f deploy_key -C "github-actions-deploy" -N ""
   ```
2. Append `deploy_key.pub` to `~/.ssh/authorized_keys` on the VPS, for the
   user that owns `/opt/aquatace-streamline`.
3. In the GitHub repo → Settings → Secrets and variables → Actions, add:
   - `VPS_HOST` — the VPS's IP or hostname
   - `VPS_USER` — the SSH user
   - `VPS_SSH_KEY` — the **private** key contents (`deploy_key`)
   - `VPS_APP_DIR` — `/opt/aquatace-streamline`
4. Delete the local `deploy_key`/`deploy_key.pub` once both are stored.

From then on, `git push` to `main` auto-deploys — watch progress under the
repo's **Actions** tab.

This workflow doesn't run schema migrations or the data export — those are
one-time steps (Part 1), not part of the regular deploy loop. Future schema
changes should get their own `.sql` file and be applied manually against the
VPS's Postgres.

---

## Cleanup checklist (once the new site is confirmed working)

- Cancel the Railway service.
- Pause/delete the Supabase Cloud project (`waghmlviayakkmcqnnbw`) — after
  confirming `db/data_dump.sql` has everything you need.
- Remove `nixpacks.toml` (Railway-specific) and `wrangler.toml`
  (Cloudflare Workers — unused).
- **Rotate the Supabase `service_role` key immediately, independent of the
  above** — `update-images.sh` has it hardcoded in plain text and it's already
  committed to git history pushed to GitHub. Rotate it from the Supabase
  dashboard (Project Settings → API) even before decommissioning the project.

## Known gap: order email notifications

The old order-notification emails (to the branch and customer) went through
Lovable Cloud's transactional email queue, which was backed by Supabase and no
longer exists. `src/lib/notifications.server.ts` now no-ops (logs a warning
instead of sending) — order creation still works, it just doesn't email
anyone. Wire up real SMTP delivery there (e.g. `nodemailer` + `SMTP_*` env
vars) if/when you want that back.
