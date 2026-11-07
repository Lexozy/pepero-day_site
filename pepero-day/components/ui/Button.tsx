"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { softSpring } from "@/components/motion";

type Props = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: ReactNode;
  variant?: "primary" | "ghost";
  loading?: boolean;
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", loading = false, className = "", children, disabled, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      whileHover={disabled || loading ? undefined : { y: -2, scale: 1.02 }}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={softSpring}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${variant === "primary" ? "btn-primary" : "btn-ghost"} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
        />
      )}
      {children}
    </motion.button>
  );
});

export default Button;