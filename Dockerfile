# Stage 1: Build Frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Production Server Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and server file
COPY --from=builder /app/dist ./dist
COPY server.js ./

EXPOSE 8080

CMD ["node", "server.js"]
