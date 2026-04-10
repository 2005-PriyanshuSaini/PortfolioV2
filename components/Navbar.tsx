"use client";

import Link from "next/link";
import * as React from "react";
import { smoothScrollToElement } from "../lib/scroll";

type NavItem = {
  id: string;
  label: string;
  href: string;
};

const NAV: NavItem[] = [
  { id: "home", label: "Home", href: "#home" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "blog", label: "Blog", href: "#blog" },
  { id: "stats", label: "Stats", href: "#stats" },
  { id: "contact", label: "Contact", href: "#contact" }
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  smoothScrollToElement(el, { durationMs: 900, offsetPx: 72 });
}

export default function Navbar() {
  const [active, setActive] = React.useState<string>("home");

  React.useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((x): x is HTMLElement => Boolean(x));

    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const top = visible[0]?.target?.id;
        if (top) setActive(top);
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5],
        rootMargin: "-25% 0px -65% 0px"
      }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border bg-bg/70 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          href="#home"
          className="flex items-center gap-3"
          onClick={(e) => {
            e.preventDefault();
            scrollToId("home");
          }}
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-white/5 text-sm font-bold tracking-tight">
            PS
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-fg-muted">
          {NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(item.id);
                }}
                className="relative py-2 text-fg-muted transition-colors hover:text-fg"
              >
                <span className={isActive ? "text-fg" : undefined}>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

