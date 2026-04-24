import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentLens — AI-Powered Talent Scouting & Engagement Agent",
  description: "An autonomous AI agent that parses job descriptions, discovers matching candidates, conducts conversational outreach, and produces ranked shortlists scored on Match Score and Interest Score.",
  keywords: ["AI recruiting", "talent scouting", "candidate matching", "recruitment agent", "AI HR"],
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
