export function getGitHubProfileUrl() {
  const explicit = process.env.NEXT_PUBLIC_GITHUB_URL;
  if (explicit) return explicit;
  const user = process.env.GITHUB_USERNAME;
  return user ? `https://github.com/${user}` : "https://github.com";
}

export function getLeetCodeProfileUrl() {
  const explicit = process.env.NEXT_PUBLIC_LEETCODE_URL;
  if (explicit) return explicit;
  const user = process.env.LEETCODE_USERNAME ?? process.env.GITHUB_USERNAME;
  return user ? `https://leetcode.com/${user}/` : "https://leetcode.com";
}

export function getLinkedInUrl() {
  const explicit = process.env.NEXT_PUBLIC_LINKEDIN_URL;
  return explicit ?? "https://www.linkedin.com";
}

export function getXUrl() {
  const explicit = process.env.NEXT_PUBLIC_X_URL;
  return explicit ?? "https://x.com";
}

/** Public contact email (shown in footer). Set NEXT_PUBLIC_CONTACT_EMAIL in .env */
export function getContactEmail() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return email && email.length > 0 ? email : null;
}

