import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

function contentType(fileName: string) {
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/**
 * Ordered list — your path `app/public/image.png` is checked first.
 * Then root `public/` (standard Next static files).
 */
const CANDIDATE_PATHS = [
  join(process.cwd(), "app", "public", "image.png"),
  join(process.cwd(), "app", "public", "image.jpg"),
  join(process.cwd(), "app", "public", "image.jpeg"),
  join(process.cwd(), "app", "public", "image.webp"),
  join(process.cwd(), "app", "public", "hero.png"),
  join(process.cwd(), "app", "public", "hero.jpg"),
  join(process.cwd(), "public", "hero.png"),
  join(process.cwd(), "public", "hero.jpg"),
  join(process.cwd(), "public", "image.png"),
  join(process.cwd(), "public", "image.jpg"),
  join(process.cwd(), "public", "image.jpeg"),
  join(process.cwd(), "public", "image.webp")
];

export async function GET() {
  for (const filePath of CANDIDATE_PATHS) {
    try {
      const buf = await readFile(filePath);
      const base = filePath.split(/[/\\]/).pop() ?? "image.png";
      return new NextResponse(buf, {
        headers: {
          "Content-Type": contentType(base),
          "Cache-Control": "public, max-age=120, s-maxage=120"
        }
      });
    } catch {
      /* try next */
    }
  }

  return NextResponse.json(
    {
      error:
        "No hero image found. Add app/public/image.png (your path) or public/hero.png at the project root."
    },
    { status: 404 }
  );
}
