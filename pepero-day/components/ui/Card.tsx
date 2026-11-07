"use client";
import { motion } from "framer-motion";
import { pageVariants } from "@/components/motion";

export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`glass-card relative z-10 w-full max-w-xl px-6 py-10 text-center sm:px-12 sm:py-14 ${className}`}
    >
      {children}
    </motion.section>
  );
}
