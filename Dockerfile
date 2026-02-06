FROM node:lts-alpine AS base

RUN corepack enable pnpm

FROM base AS deps
RUN apk add --no-cache libc6-compat

FROM deps AS frontend_deps
WORKDIR /app

COPY frontend/package.json frontend/pnpm-lock.yaml* ./

RUN pnpm i --frozen-lockfile;

FROM deps AS server_deps
WORKDIR /app

COPY server/package.json server/pnpm-lock.yaml* ./

RUN pnpm i --frozen-lockfile;

FROM base AS frontend_build
WORKDIR /app

COPY --from=frontend_deps /app/node_modules ./node_modules
COPY frontend/ ./

ENV NODE_ENV=production

RUN pnpm run build

FROM base AS server_build
WORKDIR /app

COPY --from=server_deps /app/node_modules ./node_modules
COPY server/ ./

RUN pnpm run build

FROM node:lts-alpine AS production
WORKDIR /app

ARG BASE_URL
ARG MONGO_URI
ARG MONGO_DB_NAME
ARG CORS_ORIGINS

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 runner -D -G nodejs

COPY --from=frontend_build /app/dist ./dist
COPY --from=server_deps /app/node_modules ./node_modules
COPY --from=server_build /app/dist ./

COPY ./scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER runner

ENV NODE_ENV=production
ENV PORT=80
ENV STATIC_DIR_PATH=/app/dist
ENV BASE_URL=${BASE_URL}
ENV MONGO_URI=${MONGO_URI}
ENV MONGO_DB_NAME=${MONGO_DB_NAME}
ENV CORS_ORIGINS=${CORS_ORIGINS}

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "index.js"]
