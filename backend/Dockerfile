# Use Node.js LTS (Alpine for smaller size)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose API port
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
