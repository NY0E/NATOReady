import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NATOReady — Phonetic Alphabet Drills",
  description: "Build the reflexive recall you need on the air. Drill the NATO phonetic alphabet until it's instant.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
