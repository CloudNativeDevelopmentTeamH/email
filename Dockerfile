### Build stage
FROM node:24-alpine AS builder
WORKDIR /app

# Copy package files & install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code & build the application
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src ./src
RUN npm run build



### Production stage
FROM node:24-alpine AS production
WORKDIR /app

# Copy package files & only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Install drizzle-kit for migrations
COPY --from=builder /app/dist ./dist

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set permissions
RUN chown -R node:node /app
USER node

# Start the application
ENTRYPOINT ["docker-entrypoint.sh"]
