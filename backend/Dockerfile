FROM oven/bun:1
WORKDIR /workspace
COPY types ./types
COPY backend ./backend
WORKDIR /workspace/backend
RUN bun install --frozen-lockfile
ENV DATABASE_PATH=/workspace/backend/data/promotions.db
EXPOSE 3001
CMD ["bun", "run", "start"]
