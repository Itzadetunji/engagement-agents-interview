"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  SCRAPE_SOCKET_EVENTS,
  type ScrapeActiveSessionPayload,
  type ScrapeFailedPayload,
  type ScrapeProgressPayload,
  type ScrapeSocketPayload,
} from "@shared/scrapeSocket";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export interface ScrapeSocketHandlers {
  onActive?: (sessions: ScrapeActiveSessionPayload[]) => void;
  onStarted?: (payload: ScrapeSocketPayload) => void;
  onProgress?: (payload: ScrapeProgressPayload) => void;
  onCompleted?: (payload: ScrapeProgressPayload) => void;
  onFailed?: (payload: ScrapeFailedPayload) => void;
}

export function useScrapeSocket(handlers: ScrapeSocketHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const [connected, setConnected] = useState(false);
  const [runningSessionIds, setRunningSessionIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    const client = getSocket();

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleActive = (sessions: ScrapeActiveSessionPayload[]) => {
      setRunningSessionIds(
        new Set(sessions.map((session) => session.scrapeSessionId)),
      );
      handlersRef.current.onActive?.(sessions);
    };

    const handleStarted = (payload: ScrapeSocketPayload) => {
      setRunningSessionIds((prev) => new Set(prev).add(payload.scrapeSessionId));
      handlersRef.current.onStarted?.(payload);
    };

    const handleProgress = (payload: ScrapeProgressPayload) => {
      handlersRef.current.onProgress?.(payload);
    };

    const handleCompleted = (payload: ScrapeProgressPayload) => {
      setRunningSessionIds((prev) => {
        const next = new Set(prev);
        next.delete(payload.scrapeSessionId);
        return next;
      });
      handlersRef.current.onCompleted?.(payload);
    };

    const handleFailed = (payload: ScrapeFailedPayload) => {
      setRunningSessionIds((prev) => {
        const next = new Set(prev);
        next.delete(payload.scrapeSessionId);
        return next;
      });
      handlersRef.current.onFailed?.(payload);
    };

    client.on("connect", handleConnect);
    client.on("disconnect", handleDisconnect);
    client.on(SCRAPE_SOCKET_EVENTS.ACTIVE, handleActive);
    client.on(SCRAPE_SOCKET_EVENTS.STARTED, handleStarted);
    client.on(SCRAPE_SOCKET_EVENTS.PROGRESS, handleProgress);
    client.on(SCRAPE_SOCKET_EVENTS.COMPLETED, handleCompleted);
    client.on(SCRAPE_SOCKET_EVENTS.FAILED, handleFailed);

    client.connect();

    return () => {
      client.off("connect", handleConnect);
      client.off("disconnect", handleDisconnect);
      client.off(SCRAPE_SOCKET_EVENTS.ACTIVE, handleActive);
      client.off(SCRAPE_SOCKET_EVENTS.STARTED, handleStarted);
      client.off(SCRAPE_SOCKET_EVENTS.PROGRESS, handleProgress);
      client.off(SCRAPE_SOCKET_EVENTS.COMPLETED, handleCompleted);
      client.off(SCRAPE_SOCKET_EVENTS.FAILED, handleFailed);
      client.disconnect();
    };
  }, []);

  return { connected, runningSessionIds };
}
