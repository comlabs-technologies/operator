import { Bell, Check, Loader2, Pause, ShieldCheck, Sparkles, X, Zap, Wrench } from "lucide-react";
import type { StepKind } from "@/lib/mock/workflows";
import type { StepState } from "@/lib/runtime/workflows";
import { cn } from "@/lib/utils";

const kindIcon: Record<StepKind, typeof Zap> = {
  trigger: Zap,
  tool: Wrench,
  generate: Sparkles,
  approval: ShieldCheck,
  notify: Bell,
};

export const kindLabel: Record<StepKind, string> = {
  trigger: "Trigger",
  tool: "Tool",
  generate: "Generate",
  approval: "Approval",
  notify: "Notify",
};

export function StepIcon({ kind, state = "idle", className }: { kind: StepKind; state?: StepState; className?: string }) {
  const Icon =
    state === "running" ? Loader2 : state === "done" ? Check : state === "waiting" ? Pause : state === "blocked" ? X : kindIcon[kind];
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-md border transition-colors duration-200",
        state === "idle" && "border-line bg-surface text-ink-2",
        state === "running" && "border-blue-line bg-blue-bg text-blue",
        state === "done" && "border-green-line bg-green-bg text-green",
        state === "waiting" && "border-amber-line bg-amber-bg text-amber",
        state === "blocked" && "border-red-line bg-red-bg text-red",
        className,
      )}
    >
      <Icon className={cn("size-3.5", state === "running" && "animate-spin")} strokeWidth={2} />
    </span>
  );
}
