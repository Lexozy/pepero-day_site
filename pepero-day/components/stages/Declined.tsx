"use client";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { fadeUp, staggerParent } from "@/components/motion";
import { TEXT } from "@/lib/texts";
import { Heart } from "@/components/icons";

export default function Declined() {
  return (
    <Card>
      <motion.div variants={staggerParent} initial="initial" animate="animate" className="flex flex-col items-center">
        <motion.div variants={fadeUp} className="mb-6">
          <Heart className="h-10 w-10 text-white drop-shadow-[0_8px_18px_rgba(36,60,90,0.25)]" />
        </motion.div>
        <motion.p variants={fadeUp} className="font-serif text-2xl leading-snug text-navy sm:text-3xl">
          {TEXT.declined}
        </motion.p>
      </motion.div>
    </Card>
  );
}
