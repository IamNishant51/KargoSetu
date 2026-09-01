FROM node:18-bullseye

WORKDIR /app

# Install native compilation tools for TensorFlow.js
RUN apt-get update && apt-get install -y build-essential python3

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate || true

EXPOSE 3001

CMD ["npm", "start"]
