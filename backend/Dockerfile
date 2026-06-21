FROM node:20-bookworm-slim

WORKDIR /workspace

# Native build tools for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY types ./types
COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /workspace/backend
RUN npm ci

COPY backend/ ./
ENV DATABASE_PATH=/workspace/backend/data/promotions.db
EXPOSE 3001
CMD ["npm", "run", "start"]
