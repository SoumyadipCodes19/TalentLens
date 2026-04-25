import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentLens",
  description: "Autonomous recruiting and talent engagement.",
  keywords: ["AI recruiting", "talent scouting", "candidate matching"],
};

import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
