"use client";

import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect } from "react";
import { formatNumber } from "@/lib/utils";

/** Counts smoothly to the new value when it changes. */
export function AnimatedNumber({ value, format = formatNumber }: { value: number; format?: (n: number) => string }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => format(Math.round(v)));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] });
    return () => controls.stop();
  }, [mv, value]);
  return <motion.span className="tabular">{text}</motion.span>;
}
