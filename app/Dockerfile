FROM node:20-bookworm-slim

WORKDIR /workspace

COPY types ./types
COPY app/package.json app/package-lock.json ./app/
WORKDIR /workspace/app
RUN npm ci

COPY app/ ./

ENV NEXT_PUBLIC_API_URL=http://localhost:3001
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
