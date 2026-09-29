import { cn } from "@/lib/utils";

/** Read-only JSON viewer with light token colouring. */
export function JsonBlock({ value, className }: { value: unknown; className?: string }) {
  const json = JSON.stringify(value, null, 2) ?? "null";
  const parts = json.split(/("(?:\\.|[^"\\])*"(?:\s*:)?|\b-?\d+(?:\.\d+)?\b|\btrue\b|\bfalse\b|\bnull\b)/g);
  return (
    <pre
      className={cn(
        "scrollbar-thin overflow-x-auto rounded-lg border border-line bg-surface-muted px-3.5 py-3 font-mono text-[11.5px] leading-[18px] text-ink-2",
        className,
      )}
    >
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^".*":$/.test(part.replace(/\s/g, ""))) return <span key={i} className="text-ink">{part}</span>;
        if (part.startsWith('"')) return <span key={i} className="text-green">{part}</span>;
        if (/^(true|false|null)$/.test(part)) return <span key={i} className="text-blue">{part}</span>;
        if (/^-?\d/.test(part)) return <span key={i} className="text-amber">{part}</span>;
        return part;
      })}
    </pre>
  );
}
