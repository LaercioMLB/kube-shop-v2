FROM node:24.15.0-alpine3.23 AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --omit=dev --workspace apps/backend --ignore-scripts

FROM node:24.15.0-alpine3.23 AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=dependencies --chown=node:node /app/apps/backend ./apps/backend
COPY --chown=node:node apps/backend/src ./apps/backend/src
COPY --chown=node:node scripts/smoke.mjs ./scripts/smoke.mjs
WORKDIR /app/apps/backend
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
