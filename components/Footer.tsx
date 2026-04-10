import * as React from "react";
import { getContactEmail, getGitHubProfileUrl, getLinkedInUrl, getXUrl } from "../lib/links";

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2C6.477 2 2 6.56 2 12.187c0 4.51 2.865 8.334 6.839 9.686.5.096.682-.22.682-.49 0-.24-.008-.874-.013-1.716-2.782.62-3.369-1.366-3.369-1.366-.455-1.175-1.11-1.488-1.11-1.488-.908-.638.069-.625.069-.625 1.004.072 1.532 1.054 1.532 1.054.892 1.556 2.341 1.106 2.91.846.091-.66.35-1.106.636-1.36-2.22-.26-4.555-1.134-4.555-5.046 0-1.114.39-2.025 1.029-2.739-.103-.26-.446-1.305.098-2.72 0 0 .84-.274 2.75 1.046A9.32 9.32 0 0 1 12 6.844c.85.004 1.705.117 2.504.345 1.909-1.32 2.747-1.046 2.747-1.046.546 1.415.203 2.46.1 2.72.64.714 1.027 1.625 1.027 2.739 0 3.922-2.339 4.783-4.566 5.038.36.317.68.94.68 1.895 0 1.368-.012 2.47-.012 2.807 0 .272.18.59.688.49C19.137 20.517 22 16.694 22 12.187 22 6.56 17.523 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.369-1.85 3.603 0 4.267 2.372 4.267 5.458v6.283zM5.337 7.433a2.065 2.065 0 1 1 0-4.13 2.065 2.065 0 0 1 0 4.13zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.901 2H22l-6.77 7.74L23.5 22h-6.47l-5.07-6.64L6.16 22H3l7.24-8.28L.5 2H7.14l4.58 6.05L18.9 2Zm-1.13 18.07h1.72L6.2 3.85H4.36l13.41 16.22Z" />
    </svg>
  );
}

export default function Footer() {
  const githubUrl = getGitHubProfileUrl();
  const linkedInUrl = getLinkedInUrl();
  const xUrl = getXUrl();
  const email = getContactEmail();
  return (
    <footer id="contact" className="bg-bg section" style={{ scrollMarginTop: 88 }}>
      <div className="container-page">
        <div className="card flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
          {email ? (
            <a
              className="text-sm font-medium text-fg-muted transition hover:text-accent"
              href={`mailto:${email}`}
            >
              {email}
            </a>
          ) : null}

          <div className="flex items-center gap-3 md:ml-auto">
            <a
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-white/5 text-fg transition hover:bg-white/10"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <GitHubIcon className="h-5 w-5" />
            </a>
            <a
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-white/5 text-fg transition hover:bg-white/10"
              href={xUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="X"
            >
              <XIcon className="h-5 w-5" />
            </a>
            <a
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-white/5 text-fg transition hover:bg-white/10"
              href={linkedInUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

