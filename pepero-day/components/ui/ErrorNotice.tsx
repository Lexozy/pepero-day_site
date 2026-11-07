"use client";
import { AnimatePresence, motion } from "framer-motion";
import { TEXT } from "@/lib/texts";

export default function ErrorNotice({ message, onRetry }: { message: string | null; onRetry?: () => void }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="mx-auto mt-6 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-blush bg-blush/25 px-5 py-4 text-sm text-navy sm:flex-row sm:text-left"
        >
          <span className="flex-1">{message}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-navy px-4 py-2 text-xs font-medium text-white hover:bg-navy-soft"
            >
              {TEXT.errors.retry}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
