"use client";

import { Check, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * High-level execution metadata — which systems were touched and what came
 * back. Deliberately not model reasoning.
 */
export function ExecutionTrace({ lines, running, className }: { lines: string[]; running: boolean; className?: string }) {
  return (
    <ol className={cn("space-y-1.5", className)}>
      <AnimatePresence initial={false}>
        {lines.map((line, i) => {
          const active = running && i === lines.length - 1;
          return (
            <motion.li
              key={`${i}-${line}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 text-xs"
            >
              {active ? (
                <Loader2 className="size-3.5 animate-spin text-muted" />
              ) : (
                <Check className="size-3.5 text-green" strokeWidth={2.25} />
              )}
              <span className={active ? "text-ink-2" : "text-muted"}>{line}</span>
            </motion.li>
          );
        })}
      </AnimatePresence>
      {running && lines.length === 0 && (
        <li className="flex items-center gap-2 text-xs text-muted">
          <Loader2 className="size-3.5 animate-spin" /> Executing securely…
        </li>
      )}
    </ol>
  );
}

/** Append a trace line, collapsing repeated "Checking <system>" lines. */
export function appendTraceLine(lines: string[], line: string) {
  if (lines[lines.length - 1] === line) return lines;
  if (line.startsWith("Checking ") && lines.includes(line)) return lines;
  return [...lines, line];
}
