# ──────────────────────────────────────────────
# ACMS Server (Node.js Express API)
# ──────────────────────────────────────────────
FROM node:18-alpine AS server

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ .

EXPOSE 5000
CMD ["node", "server.js"]

# ──────────────────────────────────────────────
# ACMS Client (Vite React SPA — production build)
# ──────────────────────────────────────────────
FROM node:18-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM nginx:alpine AS client
COPY --from=client-build /app/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
