"use client";
import { motion, useReducedMotion } from "framer-motion";
import { PeperoStick, Ribbon, Star } from "./icons";

interface Item {
  node: React.ReactNode;
  className: string;
  dur: number;
  delay: number;
  drift: number;
}

const ITEMS: Item[] = [
  { node: <PeperoStick className="h-24 w-6 rotate-[18deg] sm:h-32 sm:w-7" />, className: "left-[6%] top-[10%]", dur: 7, delay: 0, drift: 10 },
  { node: <PeperoStick className="h-20 w-5 -rotate-[24deg] sm:h-28 sm:w-6" />, className: "right-[7%] bottom-[12%]", dur: 8, delay: 1.2, drift: 12 },
  { node: <Star className="h-4 w-4 text-navy/50" />, className: "left-[18%] bottom-[22%]", dur: 5.5, delay: 0.4, drift: 6 },
  { node: <Star className="h-3 w-3 text-powder" />, className: "right-[22%] top-[16%]", dur: 6, delay: 1.8, drift: 7 },
  { node: <Star className="h-5 w-5 text-cream" />, className: "left-[70%] top-[8%]", dur: 6.5, delay: 0.9, drift: 8 },
  { node: <Ribbon className="h-7 w-12 text-blush/80" />, className: "left-[10%] bottom-[8%]", dur: 9, delay: 0.6, drift: 9 },
  { node: <Star className="h-3 w-3 text-navy/40" />, className: "right-[10%] top-[40%]", dur: 7, delay: 2.4, drift: 5 },
];

/** Зөөлөн хөвж буй чимэглэл — цөөн, тансаг. */
export default function FloatingDecor() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {ITEMS.map((it, i) => (
        <motion.div
          key={i}
          className={`absolute ${it.className}`}
          initial={{ opacity: 0 }}
          animate={
            reduce
              ? { opacity: 0.8 }
              : { opacity: [0, 0.9, 0.9], y: [0, -it.drift, 0], rotate: [0, 3, -3, 0] }
          }
          transition={
            reduce
              ? { duration: 0.6 }
              : { duration: it.dur, delay: it.delay, repeat: Infinity, ease: "easeInOut", opacity: { duration: 1.2, delay: it.delay } }
          }
        >
          {it.node}
        </motion.div>
      ))}
    </div>
  );
}
