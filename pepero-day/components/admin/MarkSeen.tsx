"use client";
import { useEffect } from "react";
import { markSeen } from "@/app/admin/actions";

/** Session дэлгэрэнгүйг нээхэд "харсан" гэж тэмдэглэнэ. */
export default function MarkSeen({ sessionId, needed }: { sessionId: string; needed: boolean }) {
  useEffect(() => {
    if (needed) void markSeen(sessionId);
  }, [sessionId, needed]);
  return null;
}
