import type { Transition, Variants } from "framer-motion";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const softSpring: Transition = { type: "spring", stiffness: 260, damping: 26, mass: 0.9 };

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.985, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
  exit: { opacity: 0, y: -18, scale: 0.985, filter: "blur(4px)", transition: { duration: 0.35, ease: EASE } },
};

export const staggerParent: Variants = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export const tapHover = {
  whileHover: { y: -2, scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: softSpring,
};
