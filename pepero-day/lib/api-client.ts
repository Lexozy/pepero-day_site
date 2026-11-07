"use client";
import type { ApiResponse, ClientEvent, PublicSession } from "@/lib/types";
import { TEXT } from "@/lib/texts";

const LS_KEY = "pd_sid";

export class ClientApiError extends Error {
  constructor(
    public kind: "network" | "server" | "config",
    message: string,
  ) {
    super(message);
  }
}

function readLocalSid(): string | undefined {
  try {
    return window.localStorage.getItem(LS_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}
function writeLocalSid(sid: string) {
  try {
    window.localStorage.setItem(LS_KEY, sid);
  } catch {
    /* ignore */
  }
}

async function post<T>(url: string, body: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ ...body, sid: readLocalSid() }),
    });
  } catch {
    throw new ClientApiError("network", TEXT.errors.network);
  }
  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ClientApiError("server", TEXT.errors.server);
  }
  if (!json.ok) {
    if (json.code === "config") throw new ClientApiError("config", TEXT.errors.config);
    throw new ClientApiError("server", TEXT.errors.server);
  }
  return json.data;
}

export async function startSession(): Promise<PublicSession> {
  const { session } = await post<{ session: PublicSession; created: boolean }>("/api/session", {});
  writeLocalSid(session.id);
  return session;
}

export async function sendEvent(ev: ClientEvent): Promise<PublicSession> {
  const { session } = await post<{ session: PublicSession }>("/api/event", ev as unknown as Record<string, unknown>);
  return session;
}
