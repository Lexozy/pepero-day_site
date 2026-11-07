import Link from "next/link";

export default function SessionNotFound() {
  return (
    <div className="glass-card max-w-md px-6 py-8 text-center">
      <h1 className="font-serif text-xl text-navy">Session олдсонгүй</h1>
      <Link href="/admin" className="mt-4 inline-block text-sm text-navy/70 underline">
        Самбар руу буцах
      </Link>
    </div>
  );
}
