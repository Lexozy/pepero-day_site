const TZ = "Asia/Ulaanbaatar";

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("mn-MN", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function fmtRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "дөнгөж сая";
  if (m < 60) return `${m} мин өмнө`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} цаг өмнө`;
  const d = Math.round(h / 24);
  return `${d} өдөр өмнө`;
}

export function shortId(id: string) {
  return id.slice(0, 8);
}
