# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 3000

# We'll override CMD via docker-compose
CMD ["npm", "start"]