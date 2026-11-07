"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorNotice from "@/components/ui/ErrorNotice";
import { EASE } from "@/components/motion";
import { TEXT } from "@/lib/texts";

interface Props {
  opened: boolean;
  pending: boolean;
  error: string | null;
  onOpen: () => void;
  onContinue: () => void;
}

/** Gift box — хэсэг бүр нь тусдаа motion элемент тул нээгдэх үед тусдаа хөдөлнө. */
function GiftBox({ opened, reduce }: { opened: boolean; reduce: boolean }) {
  const d = reduce ? 0.01 : 1;
  return (
    <svg viewBox="0 0 220 220" className="h-48 w-48 sm:h-60 sm:w-60" aria-hidden>
      <defs>
        <linearGradient id="boxGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#EAF3FD" />
        </linearGradient>
        <linearGradient id="lidGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#B9D4EE" />
          <stop offset="1" stopColor="#A9C9E8" />
        </linearGradient>
      </defs>

      {/* Сүүдэр */}
      <motion.ellipse
        cx="110"
        cy="196"
        rx="70"
        ry="9"
        fill="#243C5A"
        animate={{ opacity: opened ? 0.05 : 0.12 }}
        transition={{ duration: 0.8 * d }}
      />

      {/* Хайрцгийн их бие */}
      <motion.g animate={opened ? { y: 10, opacity: 0.35 } : { y: 0, opacity: 1 }} transition={{ duration: 0.9 * d, delay: 0.5 * d, ease: EASE }}>
        <rect x="45" y="92" width="130" height="100" rx="14" fill="url(#boxGrad)" stroke="#243C5A" strokeOpacity="0.12" />
        {/* Босоо тууз */}
        <rect x="101" y="92" width="18" height="100" fill="#243C5A" />
        <rect x="104" y="92" width="3" height="100" fill="white" opacity="0.25" />
      </motion.g>

      {/* Таг */}
      <motion.g
        style={{ originX: 0.5, originY: 1 }}
        animate={opened ? { y: -70, rotate: -14, x: 18, opacity: 0 } : { y: 0, rotate: 0, x: 0, opacity: 1 }}
        transition={{ duration: 1.1 * d, ease: EASE }}
      >
        <rect x="36" y="70" width="148" height="30" rx="10" fill="url(#lidGrad)" stroke="#243C5A" strokeOpacity="0.15" />
        <rect x="101" y="70" width="18" height="30" fill="#243C5A" />
        {/* Бантик */}
        <motion.g animate={opened ? { scale: 0.6, opacity: 0 } : { scale: 1, opacity: 1 }} transition={{ duration: 0.6 * d, ease: EASE }} style={{ originX: 0.5, originY: 0.5 }}>
          <path d="M110 68c-10-16-28-22-38-14-8 6-6 18 2 22 12 6 26 0 36-8z" fill="#243C5A" />
          <path d="M110 68c10-16 28-22 38-14 8 6 6 18-2 22-12 6-26 0-36-8z" fill="#243C5A" />
          <path d="M110 68c-7-10-18-14-25-10 8 2 16 6 25 10z" fill="white" opacity="0.2" />
          <circle cx="110" cy="68" r="7" fill="#F5EBDD" />
        </motion.g>
      </motion.g>

      {/* Нээгдэх үед гарах гэрэл */}
      <AnimatePresence>
        {opened && !reduce && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 1.6, delay: 0.3 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const x = 60 + i * 25;
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy="90"
                  r="3"
                  fill={i % 2 ? "#A9C9E8" : "#E8C8D6"}
                  animate={{ cy: [90, 30 - i * 6], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.4, delay: 0.35 + i * 0.1, ease: "easeOut" }}
                />
              );
            })}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

export default function GiftReveal({ opened, pending, error, onOpen, onContinue }: Props) {
  const reduce = Boolean(useReducedMotion());
  const d = reduce ? 0 : 1;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col items-center">
        <motion.button
          type="button"
          onClick={onOpen}
          disabled={opened || pending}
          aria-label={TEXT.gift.hint}
          className="group relative rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-powder/60 disabled:cursor-default"
          animate={opened || reduce ? { y: 0 } : { y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: opened || reduce ? 0 : Infinity, ease: "easeInOut" }}
          whileHover={opened ? undefined : { scale: 1.04 }}
          whileTap={opened ? undefined : { scale: 0.96 }}
        >
          <GiftBox opened={opened} reduce={reduce} />
        </motion.button>

        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4 text-sm text-navy/60"
            >
              {pending ? TEXT.errors.saving : TEXT.gift.hint}
            </motion.p>
          ) : (
            <motion.div key="text" className="mt-2 flex flex-col items-center">
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 * d, delay: 1.1 * d, ease: EASE }}
                className="font-serif text-2xl leading-snug text-navy sm:text-3xl"
              >
                {TEXT.gift.line1}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 * d, delay: 2.4 * d, ease: EASE }}
                className="mt-6 max-w-md text-base leading-relaxed text-navy/80 sm:text-lg"
              >
                {TEXT.gift.line2}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 * d, delay: 3.9 * d, ease: EASE }}
                className="mt-10"
              >
                <Button onClick={onContinue} className="min-w-[200px]">
                  {TEXT.gift.next}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ErrorNotice message={error} />
    </Card>
  );
}
