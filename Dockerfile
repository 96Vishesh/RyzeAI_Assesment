# ============================================
# RyzeAI UI Generator - Multi-stage Dockerfile
# ============================================

# --- Stage 1: Build the React client ---
FROM node:20-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# --- Stage 2: Build the Express server ---
FROM node:20-alpine AS server-build

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx tsc -b

# --- Stage 3: Production image ---
FROM node:20-alpine AS production

WORKDIR /app

# Copy server build and dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY --from=server-build /app/server/dist ./server/dist

# Copy client build
COPY --from=client-build /app/client/dist ./client/dist

# Environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start the server (serves both API + static client)
CMD ["node", "server/dist/index.js"]
