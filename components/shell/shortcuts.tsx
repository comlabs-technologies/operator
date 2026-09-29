"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useUI } from "./ui-store";

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

/** Global keyboard shortcuts and the initial responsive sidebar state. */
export function GlobalShortcuts() {
  useEffect(() => {
    const ui = useUI.getState;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("operator.sidebar");
    } catch {}
    const narrow = window.matchMedia("(max-width: 1279px)").matches;
    if (saved ? saved === "collapsed" : narrow) useUI.setState({ collapsed: true });

    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (ui().overlay === "palette") ui().close();
        else ui().open("palette");
      } else if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        ui().setCollapsed(!ui().collapsed);
      } else if (e.key === "/" && !isTyping(e.target) && !ui().overlay) {
        e.preventDefault();
        ui().open("search");
      } else if (e.key === "?" && !isTyping(e.target) && !ui().overlay) {
        e.preventDefault();
        ui().open("shortcuts");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}

const shortcuts = [
  { keys: ["⌘", "K"], label: "Command menu" },
  { keys: ["/"], label: "Search workspace" },
  { keys: ["⌘", "B"], label: "Toggle sidebar" },
  { keys: ["↑", "↓"], label: "Move between table rows" },
  { keys: ["↵"], label: "Open selected row" },
  { keys: ["?"], label: "Show shortcuts" },
];

export function ShortcutsDialog() {
  const overlay = useUI((s) => s.overlay);
  const close = useUI((s) => s.close);
  return (
    <Dialog open={overlay === "shortcuts"} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Ctrl replaces ⌘ on Windows and Linux.</DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-line px-5 py-1.5">
          {shortcuts.map((s) => (
            <li key={s.label} className="flex items-center justify-between py-2.5 text-sm text-ink-2">
              {s.label}
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
