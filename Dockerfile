# Use official Node runtime
FROM node:20-alpine

# Install PostgreSQL client for wait script
RUN apk add --no-cache postgresql-client

# Create app directory
WORKDIR /app

# Copy wait-for-db script first
COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy full project
COPY . .

# Build frontend + backend
RUN npm run build

# Expose backend port
EXPOSE 5000

# Start production server with wait script
CMD [ "db", "node", "dist/index.cjs"]