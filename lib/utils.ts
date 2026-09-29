import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-IN");

/** ₹8,83,584 — Indian digit grouping. */
export function formatINR(value: number) {
  return `₹${inr.format(value)}`;
}

/** ₹8.4L / ₹1.2Cr — compact lakh / crore notation used across Indian finance teams. */
export function formatLakh(value: number, digits = 1) {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(digits)}Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(digits)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(digits)}K`;
  return `₹${value}`;
}

export function formatNumber(value: number) {
  return num.format(value);
}

export function formatDuration(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

/**
 * The demo workspace runs on a fixed clock so seeded data always reads
 * "2m ago", "12m ago" etc. Real elapsed time is added on the client so new
 * events created during a session sort and age naturally.
 */
export const DEMO_BASE = new Date("2026-09-29T11:43:00+05:30").getTime();
const sessionStart = Date.now();

export function demoNow() {
  if (typeof window === "undefined") return DEMO_BASE;
  return DEMO_BASE + (Date.now() - sessionStart);
}

export function minutesAgo(minutes: number) {
  return new Date(DEMO_BASE - minutes * 60_000).toISOString();
}

export function relativeTime(iso: string, now = demoNow()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

const timeFmt = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Kolkata",
});
const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});

export function clockTime(iso: string) {
  return timeFmt.format(new Date(iso));
}

export function shortDate(iso: string) {
  return dateFmt.format(new Date(iso));
}

/** "11:41" for today, "28 Sep" otherwise. */
export function logTime(iso: string) {
  const d = new Date(iso);
  const sameDay = dateFmt.format(d) === dateFmt.format(new Date(DEMO_BASE));
  return sameDay ? timeFmt.format(d) : `${dateFmt.format(d)}, ${timeFmt.format(d)}`;
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** ISO timestamp on the demo clock. */
export function nowISO() {
  return new Date(demoNow()).toISOString();
}
