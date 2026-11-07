import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="glass-card max-w-md px-8 py-10 text-center">
        <p className="font-serif text-2xl text-navy">Хуудас олдсонгүй</p>
        <Link href="/" className="btn-primary mt-6">
          Нүүр хуудас 🤍
        </Link>
      </div>
    </main>
  );
}
