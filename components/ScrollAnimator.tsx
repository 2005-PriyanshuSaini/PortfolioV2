"use client";

import * as React from "react";
import { easeInOutCubic } from "../lib/scroll";

type Props = {
  children: React.ReactNode;
};

export default function ScrollAnimator({ children }: Props) {
  React.useEffect(() => {
    const root = document.scrollingElement ?? document.documentElement;

    let raf = 0;
    let isEnabled = true;
    let current = window.scrollY;
    let target = window.scrollY;

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const maxScrollY = () => Math.max(0, root.scrollHeight - window.innerHeight);

    const animate = () => {
      const start = performance.now();
      const from = current;
      const to = target;
      const delta = to - from;
      const duration = 520;

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = easeInOutCubic(t);
        current = from + delta * eased;
        window.scrollTo(0, current);
        if (t < 1) {
          raf = requestAnimationFrame(step);
        } else {
          raf = 0;
        }
      };

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (!isEnabled) return;
      if (e.ctrlKey || e.metaKey) return; // allow browser zoom gestures
      if (Math.abs(e.deltaY) < 1) return;

      e.preventDefault();
      current = window.scrollY;

      // Normalize trackpad vs mouse wheel a bit
      const isTrackpad = Math.abs(e.deltaY) < 50;
      const mult = isTrackpad ? 1.1 : 1.4;
      const next = target + e.deltaY * mult;

      target = clamp(next, 0, maxScrollY());
      animate();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isEnabled) return;
      const keys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
      if (!keys.includes(e.key)) return;

      const viewport = window.innerHeight;
      let delta = 0;
      if (e.key === "ArrowDown") delta = 80;
      if (e.key === "ArrowUp") delta = -80;
      if (e.key === "PageDown") delta = viewport * 0.9;
      if (e.key === "PageUp") delta = -viewport * 0.9;
      if (e.key === "Home") delta = -1e9;
      if (e.key === "End") delta = 1e9;
      if (e.key === " ") delta = e.shiftKey ? -viewport * 0.9 : viewport * 0.9;

      e.preventDefault();
      current = window.scrollY;
      target = clamp((e.key === "Home" ? 0 : e.key === "End" ? maxScrollY() : target + delta), 0, maxScrollY());
      animate();
    };

    const onResize = () => {
      target = clamp(target, 0, maxScrollY());
      current = clamp(current, 0, maxScrollY());
    };

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateEnabled = () => {
      isEnabled = !mql.matches;
    };
    updateEnabled();
    mql.addEventListener("change", updateEnabled);

    // If user drags scrollbar / touch scrolls, keep targets aligned
    const onScroll = () => {
      if (raf) return;
      current = window.scrollY;
      target = window.scrollY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("keydown", onKeyDown as any);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll as any);
      mql.removeEventListener("change", updateEnabled);
    };
  }, []);

  return <>{children}</>;
}

