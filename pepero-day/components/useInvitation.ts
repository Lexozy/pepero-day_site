"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ClientApiError, sendEvent, startSession } from "@/lib/api-client";
import type { ClientEvent, PublicSession } from "@/lib/types";

export type Status = "booting" | "ready" | "boot_error";

/**
 * Session-ийн эх сурвалж нь ЗӨВХӨН сервер. Товч дарахад эхлээд хадгална,
 * амжилттай хадгалагдсан хариу ирсний дараа л дараагийн хуудас руу шилжинэ.
 */
export function useInvitation() {
  const [status, setStatus] = useState<Status>("booting");
  const [session, setSession] = useState<PublicSession | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const boot = useCallback(async () => {
    setStatus("booting");
    setError(null);
    try {
      const s = await startSession();
      setSession(s);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Алдаа гарлаа.");
      setStatus("boot_error");
    }
  }, []);

  useEffect(() => {
    if (started.current) return; // StrictMode double-run → давхар visit тоолохгүй
    started.current = true;
    void boot();
  }, [boot]);

  /** Бодит хариулт: хадгалагдах хүртэл хүлээж, амжилтгүй бол алдаа харуулна. */
  const commit = useCallback(async (ev: ClientEvent): Promise<boolean> => {
    if (pending) return false;
    setPending(true);
    setError(null);
    try {
      const s = await sendEvent(ev);
      setSession(s);
      return true;
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : "Алдаа гарлаа.");
      return false;
    } finally {
      setPending(false);
    }
  }, [pending]);

  /** Analytics (moving button): UI-г блоклохгүй, алдааг чимээгүй өнгөрөөнө. */
  const dodgeBuffer = useRef(0);
  const dodgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackDodge = useCallback(() => {
    dodgeBuffer.current += 1;
    if (dodgeTimer.current) return;
    dodgeTimer.current = setTimeout(async () => {
      const count = dodgeBuffer.current;
      dodgeBuffer.current = 0;
      dodgeTimer.current = null;
      if (count <= 0) return;
      try {
        const s = await sendEvent({ type: "no_button_dodge", count });
        setSession((prev) => (prev ? { ...prev, no_button_dodges: s.no_button_dodges } : prev));
      } catch {
        /* analytics only */
      }
    }, 1500);
  }, []);

  useEffect(() => {
    return () => {
      if (dodgeTimer.current) clearTimeout(dodgeTimer.current);
    };
  }, []);

  return { status, session, pending, error, boot, commit, trackDodge, clearError: () => setError(null) };
}
