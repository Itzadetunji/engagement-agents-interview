FROM oven/bun:1
WORKDIR /workspace
COPY types ./types
COPY app ./app
WORKDIR /workspace/app
RUN bun install --frozen-lockfile
ENV NEXT_PUBLIC_API_URL=http://localhost:3001
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
