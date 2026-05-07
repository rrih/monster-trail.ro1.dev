import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monster Trail",
  description: "A browser-only retro monster RPG with a full journey from lab registration to the summit hall.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
