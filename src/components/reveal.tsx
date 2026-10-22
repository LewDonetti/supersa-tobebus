"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// Helper de animação reutilizável (fade + subida) ao entrar na viewport.
// Uso: <Reveal delay={0.1}><h2>...</h2></Reveal>
const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      variants={defaultVariants}
    >
      {children}
    </motion.div>
  );
}
