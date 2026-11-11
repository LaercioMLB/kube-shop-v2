FROM node:24.15.0-alpine3.23 AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN npm ci --workspace apps/frontend --ignore-scripts
COPY apps/frontend apps/frontend
RUN npm run build --workspace apps/frontend

FROM nginx:1.28.0-alpine AS runtime
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
USER 101:101
EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
