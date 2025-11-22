# Multi-stage build for Express backend

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package first
COPY shared/ ./shared/
WORKDIR /app/shared
RUN npm install

# Copy backend package files
WORKDIR /app/express
COPY express/package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm ci --only=development

# Copy backend source code
COPY express/ ./

# Build TypeScript to JavaScript
RUN npm run tsc

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy shared package
COPY --from=builder /app/shared ./shared
WORKDIR /app/shared
RUN npm install --only=production

# Copy backend built files and dependencies
WORKDIR /app/express
COPY --from=builder /app/express/build ./build
COPY --from=builder /app/express/node_modules ./node_modules
COPY --from=builder /app/express/package*.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
