import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import CursorGlow from "../components/CursorGlow";

export const metadata: Metadata = {
  title: "Priyanshu Saini — Portfolio",
  description: "Full Stack AI Developer & QA Engineer"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className} relative`}>
        <CursorGlow />
        <div className="relative z-[1]">{children}</div>
      </body>
    </html>
  );
}

