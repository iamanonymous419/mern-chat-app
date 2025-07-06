# -------- Stage 1: Build --------
FROM node:latest AS builder

WORKDIR /app

RUN npm install -g pnpm@latest-10

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


# -------- Stage 2: Production --------
FROM node:iron-alpine AS production

WORKDIR /app

RUN npm install -g pnpm@latest-10 vite

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy build output and node_modules
COPY --from=builder /app /app

# Fix permissions so the non-root user can write temp files
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose Vite preview port
EXPOSE 4173

# Start Vite preview server
CMD ["vite", "preview", "--host"]
