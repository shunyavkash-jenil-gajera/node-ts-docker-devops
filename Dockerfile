
# Step 1: Build stage (multi-stage for smaller image)
FROM node:22-alpine AS builder

WORKDIR /app

# Dependencies install karo (package.json + lock)
COPY package*.json ./
RUN npm ci

# Sab code copy karo
COPY . .

# TypeScript compile karo
RUN npm run build

# Step 2: Production stage (slim image)
FROM node:22-alpine

WORKDIR /app

# Sirf production deps + built files copy karo
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Production deps install (no dev deps)
RUN npm ci --only=production

# Port expose karo
EXPOSE 3000

# App start karo
CMD ["node", "dist/app.js"]