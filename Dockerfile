# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Nitro's node-server preset bundles the server and its dependencies into
# .output/server, so the runtime image only needs Node and that directory —
# no node_modules install here.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
