"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Piano from "./Piano";
import { smoothScrollToElement } from "../lib/scroll";
import { getContactEmail, getLinkedInUrl } from "../lib/links";

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.369-1.85 3.603 0 4.267 2.372 4.267 5.458v6.283zM5.337 7.433a2.065 2.065 0 1 1 0-4.13 2.065 2.065 0 0 1 0 4.13zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

export default function Hero() {
  const linkedInUrl = getLinkedInUrl();
  const contactEmail = getContactEmail();
  const [photoOk, setPhotoOk] = React.useState(true);

  return (
    <section
      id="home"
      className="relative flex min-h-[100dvh] items-center"
      style={{ scrollMarginTop: 80 }}
    >
      <div className="container-page section relative z-[1] flex w-full flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full min-w-0 lg:max-w-xl lg:flex-1"
        >
          <p className="text-sm font-semibold text-accent/90">Full Stack • AI • Product</p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight text-fg sm:text-6xl">
            Priyanshu Saini
          </h1>
          <p className="mt-5 text-xl font-semibold text-fg-muted">
            Full Stack AI Developer &amp; QA Engineer
          </p>
          <p className="mt-3 max-w-2xl text-base text-fg-muted">
            I build AI-powered products and full stack applications
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              className="btn btn-primary"
              onClick={() => {
                const el = document.getElementById("projects");
                if (el) smoothScrollToElement(el, { durationMs: 950, offsetPx: 72 });
              }}
            >
              View Projects
            </button>
            <a
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-white/5 text-fg transition hover:bg-white/10"
              href={linkedInUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
            {contactEmail ? (
              <a
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-white/5 text-fg transition hover:bg-white/10"
                href={`mailto:${contactEmail}`}
                aria-label="Email"
              >
                <MailIcon className="h-5 w-5" />
              </a>
            ) : null}
          </div>

          <div className="mt-10 max-w-3xl">
            <Piano />
            <p className="mt-3 text-sm text-fg-muted">
              Tap the keys — works with mouse and touch.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut", delay: 0.1 }}
          className="relative z-[1] w-full shrink-0 lg:max-w-md"
        >
          <div className="card relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden p-0">
            {photoOk ? (
              <img
                src="/api/hero-photo"
                alt="Priyanshu Saini"
                className="absolute inset-0 z-[1] h-full w-full object-cover object-[42%_center] scale-[1.20] motion-reduce:scale-100"
                onError={() => setPhotoOk(false)}
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 px-4 text-center">
                <span className="text-3xl font-bold tracking-tight text-fg-muted">PS</span>
                <span className="text-xs text-fg-muted">
                  Add <code className="rounded bg-white/10 px-1.5 py-0.5">app/public/image.png</code> or{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5">public/hero.png</code>
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(900px 400px at 20% 15%, rgba(99,102,241,0.12), transparent 55%), radial-gradient(700px 300px at 85% 30%, rgba(99,102,241,0.08), transparent 55%)"
        }}
      />
    </section>
  );
}

