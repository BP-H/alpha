// components/RemixMenu.tsx
"use client";

import React, { useEffect, useId, useRef, useState } from "react";

export type RemixMenuProps = {
  /** Called when the user confirms “Create remix”. */
  onRemix?: () => void;
  /** Alias some codebases use; we’ll call either if present. */
  onCreate?: () => void;
  /** Optional close callback when the menu closes. */
  onClose?: () => void;
  /** Disable the trigger button. */
  disabled?: boolean;
  /** Extra classes for outer wrapper. */
  className?: string;
  /** Optional label override for the trigger button. */
  label?: string;
};

/**
 * Minimal, dependency-free Remix menu.
 * - No external libs
 * - All props optional
 * - Exports both named and default (so `import RemixMenu` or `import { RemixMenu }` both work)
 */
export function RemixMenu({
  onRemix,
  onCreate,
  onClose,
  disabled = false,
  className = "",
  label = "Remix",
}: RemixMenuProps) {
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuId = useId();
  const headingId = useId();

  function close() {
    setOpen(false);
    // return focus to trigger after DOM updates
    setTimeout(() => triggerRef.current?.focus(), 0);
    try {
      onClose?.();
    } catch (err) {
      console.error(err);
    }
  }

  function toggle() {
    setOpen((v) => !v);
  }

  function runRemix() {
    try {
      if (onRemix) onRemix();
      else if (onCreate) onCreate();
    } catch (err) {
      console.error(err);
    }
    close();
  }

  // Global listeners only while open
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const wrap = wrapperRef.current;
      if (wrap && !wrap.contains(e.target as Node)) {
        close();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Focus first item when opened
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    if (!menu) return;
    const items = menu.querySelectorAll<HTMLElement>(
      'button,[href],[tabindex]:not([tabindex="-1"])'
    );
    (items[0] ?? menu).focus();
  }, [open]);

  // Keyboard nav within menu (ArrowUp/Down, Tab trap)
  const onMenuKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const menu = menuRef.current;
    if (!menu) return;

    const items = Array.from(
      menu.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.hasAttribute("disabled"));

    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[(currentIndex + 1 + items.length) % items.length];
      next?.focus();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[(currentIndex - 1 + items.length) % items.length];
      prev?.focus();
      return;
    }
    if (e.key === "Tab") {
      // trap focus inside the menu
      if (e.shiftKey && document.activeElement === items[0]) {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
        e.preventDefault();
        items[0].focus();
      }
    }
  };

  // Open with keyboard from trigger (Enter/Space/ArrowDown)
  const onTriggerKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="sn-btn"
        onClick={toggle}
        onKeyDown={onTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
      >
        {label}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          id={menuId}
          aria-labelledby={headingId}
          onKeyDown={onMenuKeyDown}
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 8px 24px rgba(16,24,40,0.14)",
            padding: 12,
            borderRadius: 12,
            minWidth: 240,
            zIndex: 50,
          }}
        >
          <div id={headingId} style={{ fontWeight: 800, marginBottom: 6 }}>
            Create a remix
          </div>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 10 }}>
            Keys never leave your browser. For production, route through your own FastAPI proxy if you need CORS.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="sn-btn" onClick={runRemix} role="menuitem">
              Create remix
            </button>
            <button type="button" className="sn-btn" onClick={close} role="menuitem">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RemixMenu;
