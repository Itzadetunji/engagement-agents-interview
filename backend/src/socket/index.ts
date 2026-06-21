import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import * as scrapeSessionRepo from "../db/scrapeSession.repository.js";
import {
  SCRAPE_SOCKET_EVENTS,
  type ScrapeActiveSessionPayload,
  type ScrapeFailedPayload,
  type ScrapeProgressPayload,
  type ScrapeSocketPayload,
} from "@shared/scrapeSocket.js";

let io: Server | null = null;

function activeSessionPayloads(): ScrapeActiveSessionPayload[] {
  return scrapeSessionRepo.findActiveScrapeSessions().map((session) => ({
    scrapeSessionId: session.id,
    sessionName: session.name,
    status: session.status as "pending" | "running",
  }));
}

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.emit(SCRAPE_SOCKET_EVENTS.ACTIVE, activeSessionPayloads());
  });

  return io;
}

export function getIo(): Server | null {
  return io;
}

export function emitScrapeStarted(payload: ScrapeSocketPayload): void {
  getIo()?.emit(SCRAPE_SOCKET_EVENTS.STARTED, payload);
}

export function emitScrapeProgress(payload: ScrapeProgressPayload): void {
  getIo()?.emit(SCRAPE_SOCKET_EVENTS.PROGRESS, payload);
}

export function emitScrapeCompleted(
  payload: ScrapeSocketPayload & ScrapeProgressPayload,
): void {
  getIo()?.emit(SCRAPE_SOCKET_EVENTS.COMPLETED, payload);
}

export function emitScrapeFailed(payload: ScrapeFailedPayload): void {
  getIo()?.emit(SCRAPE_SOCKET_EVENTS.FAILED, payload);
}
