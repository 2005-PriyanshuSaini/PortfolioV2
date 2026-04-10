"use client";

import * as React from "react";

/**
 * Faint indigo glow that follows the cursor. pointer-events-none so it never blocks clicks.
 */
export default function CursorGlow() {
  const ref = React.useRef<HTMLDivElement>(null);
  const pending = React.useRef(false);
  const x = React.useRef(0);
  const y = React.useRef(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const paint = () => {
      pending.current = false;
      el.style.setProperty("--glow-x", `${x.current}px`);
      el.style.setProperty("--glow-y", `${y.current}px`);
    };

    const onMove = (e: MouseEvent) => {
      x.current = e.clientX;
      y.current = e.clientY;
      if (!pending.current) {
        pending.current = true;
        requestAnimationFrame(paint);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    x.current = window.innerWidth / 2;
    y.current = window.innerHeight / 2;
    paint();

    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0 cursor-glow-layer"
      aria-hidden
    />
  );
}
