"use client";

import { create } from "zustand";

type Overlay = "palette" | "search" | "runWorkflow" | "shortcuts" | null;

interface UIState {
  collapsed: boolean;
  mobileNav: boolean;
  overlay: Overlay;
  /** Workflow preselected when the run dialog opens. */
  runWorkflowId: string | null;
  setCollapsed: (v: boolean) => void;
  setMobileNav: (v: boolean) => void;
  open: (o: Exclude<Overlay, null>, workflowId?: string) => void;
  close: () => void;
}

export const useUI = create<UIState>()((set) => ({
  collapsed: false,
  mobileNav: false,
  overlay: null,
  runWorkflowId: null,
  setCollapsed: (collapsed) => {
    try {
      localStorage.setItem("operator.sidebar", collapsed ? "collapsed" : "expanded");
    } catch {}
    set({ collapsed });
  },
  setMobileNav: (mobileNav) => set({ mobileNav }),
  open: (overlay, workflowId) => set({ overlay, runWorkflowId: workflowId ?? null, mobileNav: false }),
  close: () => set({ overlay: null }),
}));
