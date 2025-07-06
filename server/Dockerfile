# Stage 1: Build
FROM node:latest AS builder

# Set working directory
WORKDIR /app

# install pnpm 
RUN npm install -g pnpm@latest-10

# Copy package.json and package-lock.json to the working directory
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Stage 2: Production
FROM node:iron-alpine AS production

# Set working directory
WORKDIR /app

# install pnpm 
RUN npm install -g pnpm@latest-10

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Expose port
EXPOSE 3000

# Switch to non-root user
USER appuser

# Start the server
CMD ["pnpm", "start"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1