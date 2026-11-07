"use client";
import { motion, useReducedMotion } from "framer-motion";
import Card from "@/components/ui/Card";
import { EASE } from "@/components/motion";
import { TEXT } from "@/lib/texts";
import { Heart, Star } from "@/components/icons";

const SPARKS = [
  { x: -110, y: -70, d: 0.1 },
  { x: 120, y: -60, d: 0.25 },
  { x: -80, y: 70, d: 0.4 },
  { x: 95, y: 80, d: 0.55 },
  { x: 0, y: -110, d: 0.7 },
];

export default function ThankYou() {
  const reduce = useReducedMotion();
  return (
    <Card>
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
          className="relative mb-7"
        >
          <Heart className="h-14 w-14 text-white drop-shadow-[0_10px_22px_rgba(36,60,90,0.3)]" />
          {!reduce &&
            SPARKS.map((s, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 -ml-2 -mt-2"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
                transition={{ duration: 1.4, delay: 0.3 + s.d, ease: EASE }}
              >
                <Star className="h-4 w-4 text-powder" />
              </motion.span>
            ))}
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
          className="font-serif text-3xl leading-snug text-navy sm:text-4xl"
        >
          {TEXT.thanks}
        </motion.p>
      </div>
    </Card>
  );
}
