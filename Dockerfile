# Stage 1: Build the application
FROM --platform=linux/arm64/v8 node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies using the correct architecture
RUN npm ci --arch=arm64 --platform=linuxmusl

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create production image
FROM --platform=linux/arm64/v8 nginx:1.23-alpine

# Metadata
LABEL maintainer="Igor Nazarov <tigron.dev@gmail.com>"
LABEL architecture="arm64/v8"

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]