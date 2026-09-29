"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
  headerClassName?: string;
}

/**
 * Table with keyboard row navigation (↑/↓ to move, Enter to open),
 * precise selected state and horizontal scroll on narrow screens.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  selectedKey,
  empty,
  minWidth = 720,
  className,
  dense,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedKey?: string | null;
  empty?: React.ReactNode;
  minWidth?: number;
  className?: string;
  dense?: boolean;
}) {

  const onKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, row: T) => {
    const focusRow = (el: Element | null | undefined) => (el as HTMLElement | null)?.focus();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusRow(e.currentTarget.nextElementSibling);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusRow(e.currentTarget.previousElementSibling);
    } else if (e.key === "Enter" && onRowClick) {
      e.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div className={cn("scrollbar-thin overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "h-9 px-3 text-xs font-normal whitespace-nowrap text-muted first:pl-4 last:pr-4",
                  c.align === "right" ? "text-right" : "text-left",
                  c.headerClassName,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            const selected = selectedKey === key;
            return (
              <tr
                key={key}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => onKeyDown(e, row) : undefined}
                aria-selected={onRowClick ? selected : undefined}
                className={cn(
                  "group border-b border-line transition-colors duration-150 last:border-b-0",
                  onRowClick && "cursor-pointer outline-none hover:bg-surface-muted focus-visible:bg-hover",
                  selected && "bg-hover hover:bg-hover",
                )}
              >
                {columns.map((c, i) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-3 whitespace-nowrap text-ink first:pl-4 last:pr-4",
                      dense ? "h-10" : "h-11",
                      c.align === "right" && "text-right tabular",
                      i === 0 && selected && "shadow-[inset_2px_0_0_var(--ink)]",
                      c.className,
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && empty}
    </div>
  );
}
