# backend/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Install Prisma CLI globally (optional but helpful)
RUN npm install -g prisma

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code (will be overridden by volume mount, but needed for initial setup)
COPY . .

# Expose port
EXPOSE 3000

# Run in development mode — will be called by docker-compose
CMD ["npm", "run", "dev"]
